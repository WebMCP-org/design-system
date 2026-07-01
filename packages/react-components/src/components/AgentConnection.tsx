import * as React from "react";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContainer,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./CodeBlock.js";
import { Button } from "./Button.js";
import { cx } from "./_internal/class-names.js";
import { LinkIcon } from "./_internal/icons.js";
import { Popover } from "./Popover.js";

export type AgentConnectionTarget = string;

export type AgentConnectionCommand = {
  readonly target: AgentConnectionTarget;
  readonly label: string;
  readonly description: string;
  readonly language: "bash" | "json";
  readonly code: string;
};

export type ConnectionProps = React.SVGProps<SVGGElement> & {
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
};

export type NanitesAgentConnectionOptions = {
  readonly mcpName?: string;
  readonly pluginMarketplace?: string;
  readonly claudePluginRef?: string;
  readonly skillName?: string;
};

export type AgentConnectionPanelProps = {
  readonly className?: string;
  readonly commands?: readonly AgentConnectionCommand[];
  readonly defaultTarget?: AgentConnectionTarget;
  readonly headingLevel?: 2 | 3;
  readonly origin?: string;
  readonly section?: boolean;
};

export type AgentConnectionPopoverProps = Omit<AgentConnectionPanelProps, "section"> & {
  readonly className?: string;
};

const DEFAULT_LOCAL_ORIGIN = "http://localhost:5173";
const CONNECTION_CURVE_MIDPOINT = 0.5;

export function Connection({ fromX, fromY, toX, toY, ...props }: ConnectionProps) {
  const controlX = fromX + (toX - fromX) * CONNECTION_CURVE_MIDPOINT;

  return (
    <g {...props}>
      <path
        className="animated"
        d={`M${fromX},${fromY} C ${controlX},${fromY} ${controlX},${toY} ${toX},${toY}`}
        fill="none"
        stroke="var(--sigvelo-color-focus)"
        strokeWidth={1}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="var(--sigvelo-color-canvas)"
        r={3}
        stroke="var(--sigvelo-color-focus)"
        strokeWidth={1}
      />
    </g>
  );
}

function getBrowserOrigin(): string {
  if (typeof window === "undefined") {
    return DEFAULT_LOCAL_ORIGIN;
  }

  return window.location.origin;
}

function buildMcpUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/mcp`;
}

export function buildNanitesAgentConnectionCommands(
  origin: string,
  {
    mcpName = "nanites",
    pluginMarketplace = "WebMCP-org/nanites",
    claudePluginRef = "nanites@nanites",
    skillName = "nanites",
  }: NanitesAgentConnectionOptions = {},
): readonly AgentConnectionCommand[] {
  const mcpUrl = buildMcpUrl(origin);

  return [
    {
      target: "codex",
      label: "Codex",
      description: "Install the Nanites plugin marketplace, then connect this deployment over MCP.",
      language: "bash",
      code: [
        `NANITES_MCP_URL="${mcpUrl}"`,
        "",
        `codex plugin marketplace add ${pluginMarketplace}`,
        `codex mcp add ${mcpName} --url "$NANITES_MCP_URL"`,
        `codex mcp login ${mcpName}`,
      ].join("\n"),
    },
    {
      target: "claude-code",
      label: "Claude Code",
      description: "Install the Nanites plugin and add this deployment as the Nanites MCP server.",
      language: "bash",
      code: [
        `NANITES_MCP_URL="${mcpUrl}"`,
        "",
        `claude plugin marketplace add ${pluginMarketplace}`,
        `claude plugin install ${claudePluginRef}`,
        `claude mcp add --transport http --scope user ${mcpName} "$NANITES_MCP_URL"`,
      ].join("\n"),
    },
    {
      target: "skill",
      label: "Skill Only",
      description: "Install the Nanites skill without installing a plugin.",
      language: "bash",
      code: [
        `npx --yes skills add ${pluginMarketplace} \\`,
        `  --skill ${skillName} \\`,
        `  --global \\`,
        `  --copy \\`,
        `  --agent codex claude-code \\`,
        `  -y`,
      ].join("\n"),
    },
    {
      target: "mcp-json",
      label: "MCP JSON",
      description: "Use this with clients that accept direct MCP server JSON.",
      language: "json",
      code: JSON.stringify(
        {
          mcpServers: {
            [mcpName]: {
              type: "http",
              url: mcpUrl,
            },
          },
        },
        null,
        2,
      ),
    },
  ];
}

/**
 * Shows copyable install commands for connecting an agent to Nanites.
 * Use inside setup screens where users need Codex, Claude Code, skill-only,
 * or raw MCP JSON connection instructions.
 */
export function AgentConnectionPanel({
  className,
  commands: commandsProp,
  defaultTarget = "codex",
  headingLevel = 2,
  origin,
  section = true,
}: AgentConnectionPanelProps) {
  const commands = React.useMemo(
    () => commandsProp ?? buildNanitesAgentConnectionCommands(origin ?? getBrowserOrigin()),
    [commandsProp, origin],
  );
  const [target, setTarget] = React.useState<AgentConnectionTarget>(defaultTarget);
  const selected = commands.find((command) => command.target === target) ?? commands[0];
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const Wrapper = section ? "section" : "div";

  if (!selected) {
    return null;
  }

  return (
    <Wrapper className={cx("agent-connect", className)}>
      <div className="agent-connect__header">
        <div className="agent-connect__icon" aria-hidden="true">
          <LinkIcon size={18} strokeWidth={2} />
        </div>
        <div className="agent-connect__title-group">
          <Heading>Connect Agent</Heading>
          <p>{selected.description}</p>
        </div>
      </div>
      <fieldset className="agent-connect__targets">
        <legend className="agent-connect__legend">Agent connection target</legend>
        {commands.map((command) => (
          <Button
            key={command.target}
            variant="ghost"
            color="neutral"
            size="sm"
            aria-pressed={command.target === selected.target}
            data-selected={command.target === selected.target}
            className="agent-connect__target"
            onClick={() => {
              setTarget(command.target);
            }}
          >
            {command.label}
          </Button>
        ))}
      </fieldset>
      <CodeBlock code={selected.code} language={selected.language}>
        <CodeBlockHeader>
          <CodeBlockTitle>{selected.label}</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContainer>
          <CodeBlockContent />
        </CodeBlockContainer>
      </CodeBlock>
    </Wrapper>
  );
}

/**
 * Compact popover trigger for showing AgentConnectionPanel inline.
 */
export function AgentConnectionPopover({ className, ...props }: AgentConnectionPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button
            type="button"
            color="neutral"
            variant="outline"
            size="sm"
            className={cx("agent-connect-trigger", className)}
          >
            <LinkIcon size={16} strokeWidth={2} />
            <span>Connect agent</span>
          </Button>
        }
      />
      <Popover.Portal>
        <Popover.Positioner side="top" align="start" sideOffset={10}>
          <Popover.Popup className="agent-connect-popover">
            <AgentConnectionPanel {...props} section={false} />
            <Popover.Arrow />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
