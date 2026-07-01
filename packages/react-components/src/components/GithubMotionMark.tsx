import { cx } from "./_internal/class-names.js";

/**
 * Small GitHub motion mark used next to install or repository connection text.
 */
export function GithubMotionMark({
  className,
  size = 18,
}: {
  readonly className?: string;
  readonly size?: number;
}) {
  const classes = cx("github-motion-mark", className);

  return (
    <span className={classes} aria-hidden="true">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M12 .5A11.5 11.5 0 0 0 8.36 22.9c.58.1.8-.25.8-.56v-2.12c-3.22.7-3.9-1.38-3.9-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.57-.29-5.28-1.29-5.28-5.73 0-1.27.45-2.3 1.2-3.11-.12-.3-.52-1.48.11-3.07 0 0 .98-.32 3.2 1.18a11 11 0 0 1 5.82 0c2.22-1.5 3.2-1.18 3.2-1.18.63 1.6.23 2.78.11 3.07.75.82 1.2 1.85 1.2 3.1 0 4.46-2.72 5.44-5.3 5.73.42.36.8 1.08.8 2.18v3.12c0 .31.2.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
      </svg>
    </span>
  );
}
