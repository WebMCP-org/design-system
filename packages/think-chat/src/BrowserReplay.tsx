import * as React from "react";
import { Button } from "@mcp-b/react-components/components/Button";
import { PauseIcon, PlayIcon } from "@mcp-b/react-components/components/icons";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@mcp-b/react-components/components/Slider";
import { Replayer } from "@rrweb/replay";
import { cx } from "./class-names";

export interface BrowserReplayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * rrweb events for one tab, e.g. one
   * `BrowserRecording.events[targetId]` entry from Cloudflare Browser Run.
   */
  events: unknown[];
  /** Start playing on mount. */
  autoPlay?: boolean;
}

function formatReplayTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function labelReplayFrame(stage: HTMLDivElement) {
  const frame = stage.querySelector("iframe");
  if (frame) frame.title = "Browser session replay";
}

/**
 * Replays a completed Cloudflare Browser Run recording locally with rrweb.
 *
 * This is intentionally not derived from Think chat message parts. Live view
 * links and screenshots ride the `browser_execute` stream and belong to
 * `BrowserLiveView`; replay events are fetched after a session closes with
 * Browser Run's `getBrowserRecording()`. Upstream currently shapes those
 * recordings as `Record<targetId, unknown[]>`, where each array is plain rrweb
 * JSON for one tab. Playback happens in the viewer's browser through
 * `@rrweb/replay`; no replay service is contacted at playback time.
 *
 * Styling rides `@mcp-b/react-components/styles` (browser-replay.css), which
 * think-chat consumers load anyway.
 *
 * @see https://github.com/cloudflare/agents/tree/main/packages/agents/src/browser
 * @see https://github.com/rrweb-io/rrweb/tree/main/packages/%40rrweb/replay
 */
export function BrowserReplay({
  className,
  events,
  autoPlay,
  ref,
  ...props
}: BrowserReplayProps & { ref?: React.Ref<HTMLDivElement> }) {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const replayerRef = React.useRef<Replayer | null>(null);
  const rafRef = React.useRef(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.replaceChildren();
    cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);

    // rrweb needs at least a meta event plus a full snapshot to build a document.
    if (events.length < 2) return;

    let frameLabelRaf = 0;
    const handleFinish = () => {
      const replayer = replayerRef.current;
      cancelAnimationFrame(rafRef.current);
      setIsPlaying(false);
      setCurrentTime(replayer?.getMetaData().totalTime ?? 0);
    };
    const fit = ({ width, height }: { width: number; height: number }) => {
      const scale = Math.min(stage.clientWidth / width, stage.clientHeight / height, 1);
      const replayer = replayerRef.current;
      if (!replayer) return;
      replayer.wrapper.style.position = "absolute";
      replayer.wrapper.style.transform = `scale(${scale})`;
      replayer.wrapper.style.transformOrigin = "top left";
      replayer.wrapper.style.left = `${Math.max(0, (stage.clientWidth - width * scale) / 2)}px`;
      replayer.wrapper.style.top = `${Math.max(0, (stage.clientHeight - height * scale) / 2)}px`;
      labelReplayFrame(stage);
    };

    try {
      const replayer = new Replayer(events as ConstructorParameters<typeof Replayer>[0], {
        root: stage,
        mouseTail: false,
        speed: 1,
      });
      replayerRef.current = replayer;
      setDuration(replayer.getMetaData().totalTime);
      replayer.on("finish", handleFinish);
      replayer.on("resize", fit as (payload: unknown) => void);
      replayer.pause(0);
      labelReplayFrame(stage);
      frameLabelRaf = requestAnimationFrame(() => labelReplayFrame(stage));
      if (autoPlay) {
        replayer.play(0);
        setIsPlaying(true);
      }
    } catch {
      setHasError(true);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(frameLabelRaf);
      replayerRef.current?.destroy();
      replayerRef.current = null;
      stage.replaceChildren();
    };
    // ponytail: events are immutable per mount; pass a new array or remount to swap recordings.
  }, [autoPlay, events]);

  React.useEffect(() => {
    if (!isPlaying) return;
    const tick = () => {
      const replayer = replayerRef.current;
      if (replayer) setCurrentTime(Math.min(replayer.getCurrentTime(), duration));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, isPlaying]);

  const disabled = events.length < 2 || hasError || duration <= 0;

  const handlePlayPause = () => {
    const replayer = replayerRef.current;
    if (!replayer || disabled) return;

    if (isPlaying) {
      replayer.pause(currentTime);
      setIsPlaying(false);
      return;
    }

    const startAt = currentTime >= duration ? 0 : currentTime;
    replayer.play(startAt);
    setCurrentTime(startAt);
    setIsPlaying(true);
  };

  const handleScrub = (value: number | readonly number[]) => {
    const next = typeof value === "number" ? value : (value[0] ?? 0);
    setCurrentTime(next);
    const replayer = replayerRef.current;
    if (!replayer) return;
    if (isPlaying) replayer.play(next);
    else replayer.pause(next);
  };

  return (
    <div ref={ref} className={cx("browser-replay", className)} {...props}>
      <div className="browser-replay__stage-wrap">
        <div ref={stageRef} className="browser-replay__stage" />
        {events.length < 2 ? (
          <div className="browser-replay__empty">No browser recording</div>
        ) : null}
        {hasError ? (
          <div className="browser-replay__empty" role="alert">
            Browser replay could not be loaded
          </div>
        ) : null}
      </div>
      <div className="browser-replay__controls">
        <Button
          variant="ghost"
          color="neutral"
          size="icon-sm"
          className="browser-replay__toggle"
          aria-label={isPlaying ? "Pause replay" : "Play replay"}
          disabled={disabled}
          onClick={handlePlayPause}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <Slider
          className="browser-replay__scrubber"
          min={0}
          max={Math.max(duration, 1)}
          step={100}
          value={Math.min(currentTime, duration)}
          disabled={disabled}
          onValueChange={handleScrub}
        >
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb aria-label="Replay position" />
            </SliderTrack>
          </SliderControl>
        </Slider>
        <span className="browser-replay__time">
          {formatReplayTime(currentTime)} / {formatReplayTime(duration)}
        </span>
      </div>
    </div>
  );
}
