import * as React from "react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "./Combobox.js";
import {
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  type MenuItemProps,
  type MenuPopupProps,
  type MenuProps,
} from "./Menu.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
  type SelectContentProps,
  type SelectItemProps,
  type SelectProps,
  type SelectTriggerProps,
  type SelectValueProps,
} from "./Select.js";
import { Tab, TabPanel, TabsList } from "./Tabs.js";
import { Button, type ButtonProps } from "./Button.js";
import {
  Tooltip,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from "./Tooltip.js";
import { cx } from "./_internal/class-names.js";
import {
  ArrowUpIcon,
  ImageIcon,
  MonitorIcon,
  PlusIcon,
  SpinnerIcon,
  SquareIcon,
  WarningIcon,
} from "./_internal/icons.js";

export interface PromptInputFilePart {
  type: "file";
  id?: string;
  filename?: string;
  mediaType?: string;
  url?: string;
}

export interface PromptInputReferencedSource {
  id?: string;
  title?: string;
  url?: string;
  [key: string]: unknown;
}

/** The payload produced when the prompt input is submitted. */
export interface PromptInputMessage {
  text: string;
  files: PromptInputFilePart[];
}

/** Lifecycle status of an in-flight model request. */
export type PromptInputStatus = "ready" | "submitted" | "streaming" | "error";

export interface AttachmentsContext {
  files: Array<PromptInputFilePart & { id: string }>;
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface TextInputContext {
  value: string;
  setInput: (value: string) => void;
  clear: () => void;
}

export interface PromptInputControllerProps {
  textInput: TextInputContext;
  attachments: AttachmentsContext;
  __registerFileInput: (ref: React.RefObject<HTMLInputElement | null>, open: () => void) => void;
}

export interface ReferencedSourcesContext {
  sources: Array<PromptInputReferencedSource & { id: string }>;
  add: (sources: PromptInputReferencedSource[] | PromptInputReferencedSource) => void;
  remove: (id: string) => void;
  clear: () => void;
}

interface PromptInputContextValue {
  formId: string;
  submit: () => void;
}

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null);
const PromptInputController = React.createContext<PromptInputControllerProps | null>(null);
const ProviderAttachmentsContext = React.createContext<AttachmentsContext | null>(null);
const LocalAttachmentsContext = React.createContext<AttachmentsContext | null>(null);
const LocalReferencedSourcesContext = React.createContext<ReferencedSourcesContext | null>(null);

function usePromptInputContext(component: string): PromptInputContextValue {
  const ctx = React.useContext(PromptInputContext);
  if (!ctx) {
    throw new Error(`${component} must be used inside a <PromptInput>.`);
  }
  return ctx;
}

export function usePromptInputController() {
  const ctx = React.useContext(PromptInputController);
  if (!ctx) {
    throw new Error(
      "Wrap your component inside <PromptInputProvider> to use usePromptInputController().",
    );
  }
  return ctx;
}

function useOptionalPromptInputController() {
  return React.useContext(PromptInputController);
}

export function useProviderAttachments() {
  const ctx = React.useContext(ProviderAttachmentsContext);
  if (!ctx) {
    throw new Error(
      "Wrap your component inside <PromptInputProvider> to use useProviderAttachments().",
    );
  }
  return ctx;
}

function useOptionalProviderAttachments() {
  return React.useContext(ProviderAttachmentsContext);
}

export function usePromptInputAttachments() {
  const provider = useOptionalProviderAttachments();
  const local = React.useContext(LocalAttachmentsContext);
  const context = local ?? provider;
  if (!context) {
    throw new Error(
      "usePromptInputAttachments must be used within a PromptInput or PromptInputProvider.",
    );
  }
  return context;
}

export function usePromptInputReferencedSources() {
  const ctx = React.useContext(LocalReferencedSourcesContext);
  if (!ctx) {
    throw new Error("usePromptInputReferencedSources must be used within a PromptInput.");
  }
  return ctx;
}

export interface PromptInputProviderProps extends React.PropsWithChildren {
  initialInput?: string;
}

export function PromptInputProvider({ initialInput = "", children }: PromptInputProviderProps) {
  const [textInput, setTextInput] = React.useState(initialInput);
  const [attachmentFiles, setAttachmentFiles] = React.useState<
    Array<PromptInputFilePart & { id: string }>
  >([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const openRef = React.useRef<() => void>(() => {});
  const attachmentsRef = React.useRef(attachmentFiles);
  attachmentsRef.current = attachmentFiles;

  React.useEffect(
    () => () => {
      revokeFileUrls(attachmentsRef.current);
    },
    [],
  );

  const add = React.useCallback((files: File[] | FileList) => {
    const incoming = Array.from(files);
    setAttachmentFiles((prev) => [...prev, ...incoming.map(fileToPart)]);
  }, []);

  const remove = React.useCallback((id: string) => {
    setAttachmentFiles((prev) => {
      const found = prev.find((file) => file.id === id);
      if (found?.url) URL.revokeObjectURL(found.url);
      return prev.filter((file) => file.id !== id);
    });
  }, []);

  const clear = React.useCallback(() => {
    setAttachmentFiles((prev) => {
      revokeFileUrls(prev);
      return [];
    });
  }, []);

  const attachments = React.useMemo<AttachmentsContext>(
    () => ({
      add,
      clear,
      fileInputRef,
      files: attachmentFiles,
      openFileDialog: () => openRef.current(),
      remove,
    }),
    [add, attachmentFiles, clear, remove],
  );

  const controller = React.useMemo<PromptInputControllerProps>(
    () => ({
      __registerFileInput: (ref, open) => {
        fileInputRef.current = ref.current;
        openRef.current = open;
      },
      attachments,
      textInput: {
        value: textInput,
        setInput: setTextInput,
        clear: () => setTextInput(""),
      },
    }),
    [attachments, textInput],
  );

  return (
    <PromptInputController.Provider value={controller}>
      <ProviderAttachmentsContext.Provider value={attachments}>
        {children}
      </ProviderAttachmentsContext.Provider>
    </PromptInputController.Provider>
  );
}

export interface PromptInputProps extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit" | "onError"
> {
  /** Accepted file MIME types/extensions, passed to the hidden file input. */
  accept?: string;
  /** Allows multiple files in a single file picker/drop action. */
  multiple?: boolean;
  /** Listen for file drops on the whole document instead of only the form. */
  globalDrop?: boolean;
  /** Clears the hidden file input when attachments are cleared. */
  syncHiddenInput?: boolean;
  /** Maximum number of attached files. */
  maxFiles?: number;
  /** Maximum accepted file size in bytes. */
  maxFileSize?: number;
  /** Called when file validation rejects an attachment. */
  onError?: (error: { code: "max_files" | "max_file_size" | "accept"; message: string }) => void;
  /** Called with the trimmed message text and files when the form is submitted. */
  onSubmit?: (
    message: PromptInputMessage,
    event: React.FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
}

/**
 * Chat-style composer form. Wraps a textarea and footer controls, with
 * Enter-to-submit semantics, auto-resizing behavior, and optional attachments.
 * Adapted from Vercel AI Elements and restyled with Sigvelo CSS tokens.
 *
 * Use for assistant/chat submit forms. Do not use it as a generic textarea or
 * non-chat form. Sigvelo changes: uses shared Menu, Select, Combobox, Tabs,
 * Button, and Tooltip components; maps styles to CSS tokens; adds local
 * attachment and referenced-source helpers.
 *
 * The form handles Enter-to-submit while multiline editing remains in the
 * textarea. Attachment controls need accessible labels through their buttons
 * and menus. Add new shared tools here when multiple apps need them.
 *
 * @example
 * ```tsx
 * <PromptInput onSubmit={({ text, files }) => sendMessage(text, files)}>
 *   <PromptInputBody>
 *     <PromptInputTextarea placeholder="Ask Sigvelo..." />
 *   </PromptInputBody>
 *   <PromptInputFooter>
 *     <PromptInputTools>
 *       <PromptInputActionAddAttachments />
 *     </PromptInputTools>
 *     <PromptInputSubmit status="ready" />
 *   </PromptInputFooter>
 * </PromptInput>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/prompt-input | AI Elements Prompt Input}
 */
export function PromptInput({
  className,
  accept,
  multiple,
  globalDrop,
  syncHiddenInput,
  maxFiles,
  maxFileSize,
  onError,
  onSubmit,
  children,
  id,
  ref,
  ...props
}: PromptInputProps & { ref?: React.Ref<HTMLFormElement> }) {
  const generatedId = React.useId();
  const formId = id ?? generatedId;
  const controller = useOptionalPromptInputController();
  const usingProvider = Boolean(controller);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [localFiles, setLocalFiles] = React.useState<Array<PromptInputFilePart & { id: string }>>(
    [],
  );
  const [referencedSources, setReferencedSources] = React.useState<
    Array<PromptInputReferencedSource & { id: string }>
  >([]);
  const files = controller?.attachments.files ?? localFiles;
  const filesRef = React.useRef(files);
  filesRef.current = files;

  React.useImperativeHandle(ref, () => formRef.current as HTMLFormElement, []);

  React.useEffect(
    () => () => {
      if (!usingProvider) revokeFileUrls(filesRef.current);
    },
    [usingProvider],
  );

  const matchesAccept = React.useCallback(
    (file: File) => {
      if (!accept?.trim()) return true;
      return accept
        .split(",")
        .map((pattern) => pattern.trim())
        .filter(Boolean)
        .some((pattern) =>
          pattern.endsWith("/*")
            ? file.type.startsWith(pattern.slice(0, -1))
            : file.type === pattern,
        );
    },
    [accept],
  );

  const add = React.useCallback(
    (fileList: File[] | FileList) => {
      const incoming = Array.from(fileList);
      const accepted = incoming.filter(matchesAccept);
      if (incoming.length && accepted.length === 0) {
        onError?.({ code: "accept", message: "No files match the accepted types." });
        return;
      }

      const sized = accepted.filter((file) => !maxFileSize || file.size <= maxFileSize);
      if (accepted.length && sized.length === 0) {
        onError?.({ code: "max_file_size", message: "All files exceed the maximum size." });
        return;
      }

      const capacity =
        typeof maxFiles === "number" ? Math.max(0, maxFiles - filesRef.current.length) : undefined;
      const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
      if (typeof capacity === "number" && sized.length > capacity) {
        onError?.({ code: "max_files", message: "Too many files. Some were not added." });
      }
      if (!capped.length) return;

      if (controller) {
        controller.attachments.add(capped);
      } else {
        setLocalFiles((prev) => [...prev, ...capped.map(fileToPart)]);
      }
    },
    [controller, matchesAccept, maxFileSize, maxFiles, onError],
  );

  const remove = React.useCallback(
    (attachmentId: string) => {
      if (controller) {
        controller.attachments.remove(attachmentId);
        return;
      }
      setLocalFiles((prev) => {
        const found = prev.find((file) => file.id === attachmentId);
        if (found?.url) URL.revokeObjectURL(found.url);
        return prev.filter((file) => file.id !== attachmentId);
      });
    },
    [controller],
  );

  const clearAttachments = React.useCallback(() => {
    if (controller) {
      controller.attachments.clear();
      return;
    }
    setLocalFiles((prev) => {
      revokeFileUrls(prev);
      return [];
    });
  }, [controller]);

  const clearReferencedSources = React.useCallback(() => setReferencedSources([]), []);
  const clear = React.useCallback(() => {
    clearAttachments();
    clearReferencedSources();
  }, [clearAttachments, clearReferencedSources]);

  const openFileDialog = React.useCallback(() => inputRef.current?.click(), []);

  React.useEffect(() => {
    if (!controller) return;
    controller.__registerFileInput(inputRef, openFileDialog);
  }, [controller, openFileDialog]);

  React.useEffect(() => {
    if (syncHiddenInput && inputRef.current && files.length === 0) {
      inputRef.current.value = "";
    }
  }, [files.length, syncHiddenInput]);

  React.useEffect(() => {
    const target = globalDrop ? document : formRef.current;
    if (!target) return;
    const onDragOver: EventListener = (event) => {
      const dragEvent = event as DragEvent;
      if (dragEvent.dataTransfer?.types.includes("Files")) dragEvent.preventDefault();
    };
    const onDrop: EventListener = (event) => {
      const dragEvent = event as DragEvent;
      if (dragEvent.dataTransfer?.types.includes("Files")) dragEvent.preventDefault();
      if (dragEvent.dataTransfer?.files?.length) add(dragEvent.dataTransfer.files);
    };
    target.addEventListener("dragover", onDragOver);
    target.addEventListener("drop", onDrop);
    return () => {
      target.removeEventListener("dragover", onDragOver);
      target.removeEventListener("drop", onDrop);
    };
  }, [add, globalDrop]);

  const attachmentsCtx = React.useMemo<AttachmentsContext>(
    () => ({
      add,
      clear: clearAttachments,
      fileInputRef: inputRef,
      files,
      openFileDialog,
      remove,
    }),
    [add, clearAttachments, files, openFileDialog, remove],
  );

  const referencedSourcesCtx = React.useMemo<ReferencedSourcesContext>(
    () => ({
      add: (incoming) => {
        const array = Array.isArray(incoming) ? incoming : [incoming];
        setReferencedSources((prev) => [
          ...prev,
          ...array.map((source) => ({ ...source, id: source.id ?? createId() })),
        ]);
      },
      clear: clearReferencedSources,
      remove: (sourceId) =>
        setReferencedSources((prev) => prev.filter((source) => source.id !== sourceId)),
      sources: referencedSources,
    }),
    [clearReferencedSources, referencedSources],
  );

  const submit = React.useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  const ctx = React.useMemo<PromptInputContextValue>(() => ({ formId, submit }), [formId, submit]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const textarea = form.querySelector<HTMLTextAreaElement>(
        'textarea[data-prompt-input-textarea="true"]',
      );
      const text = controller?.textInput.value ?? textarea?.value.trim() ?? "";
      const submittedFiles = await Promise.all(files.map(resolveSubmittedFile));

      try {
        await onSubmit?.({ text, files: submittedFiles }, event);
        if (!controller && textarea) {
          textarea.value = "";
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
        controller?.textInput.clear();
        clear();
      } catch {
        // Preserve input and attachments so the user can retry.
      }
    },
    [clear, controller, files, onSubmit],
  );

  return (
    <PromptInputContext.Provider value={ctx}>
      <LocalAttachmentsContext.Provider value={attachmentsCtx}>
        <LocalReferencedSourcesContext.Provider value={referencedSourcesCtx}>
          <input
            ref={inputRef}
            accept={accept}
            aria-label="Upload files"
            className="prompt-input__file-input"
            multiple={multiple}
            onChange={(event) => {
              if (event.currentTarget.files?.length) add(event.currentTarget.files);
              event.currentTarget.value = "";
            }}
            tabIndex={-1}
            type="file"
          />
          <form
            ref={formRef}
            id={formId}
            className={cx("prompt-input", className)}
            onSubmit={handleSubmit}
            {...props}
          >
            {children}
          </form>
        </LocalReferencedSourcesContext.Provider>
      </LocalAttachmentsContext.Provider>
    </PromptInputContext.Provider>
  );
}

export interface PromptInputHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputHeader({
  className,
  children,
  ref,
  ...props
}: PromptInputHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("prompt-input__header", className)} {...props}>
      {children}
    </div>
  );
}

export interface PromptInputBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputBody({
  className,
  children,
  ref,
  ...props
}: PromptInputBodyProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("prompt-input__body", className)} {...props}>
      {children}
    </div>
  );
}

export interface PromptInputFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputFooter({
  className,
  children,
  ref,
  ...props
}: PromptInputFooterProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("prompt-input__footer", className)} {...props}>
      {children}
    </div>
  );
}

export interface PromptInputToolsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputTools({
  className,
  children,
  ref,
  ...props
}: PromptInputToolsProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("prompt-input__tools", className)} {...props}>
      {children}
    </div>
  );
}

const MIN_TEXTAREA_HEIGHT_PX = 48;
const MAX_TEXTAREA_HEIGHT_PX = 240;

export interface PromptInputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

export function PromptInputTextarea({
  className,
  placeholder = "How can I help?",
  rows = 1,
  minHeight = MIN_TEXTAREA_HEIGHT_PX,
  maxHeight = MAX_TEXTAREA_HEIGHT_PX,
  onChange,
  onCompositionEnd,
  onCompositionStart,
  onKeyDown,
  onInput,
  onPaste,
  ref,
  ...props
}: PromptInputTextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }) {
  const { submit } = usePromptInputContext("PromptInputTextarea");
  const controller = useOptionalPromptInputController();
  const attachments = usePromptInputAttachments();
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [isComposing, setIsComposing] = React.useState(false);

  React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement, []);

  const resize = React.useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [maxHeight, minHeight]);

  React.useLayoutEffect(() => {
    resize();
  }, [resize, props.value, props.defaultValue, controller?.textInput.value]);

  const controlledProps = controller
    ? {
        value: controller.textInput.value,
        onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
          controller.textInput.setInput(event.currentTarget.value);
          onChange?.(event);
        },
      }
    : { onChange };

  return (
    <textarea
      ref={innerRef}
      data-prompt-input-textarea="true"
      className={cx("prompt-input__textarea", className)}
      name="message"
      placeholder={placeholder}
      rows={rows}
      onCompositionEnd={(event) => {
        setIsComposing(false);
        onCompositionEnd?.(event);
      }}
      onCompositionStart={(event) => {
        setIsComposing(true);
        onCompositionStart?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !isComposing &&
          !event.nativeEvent.isComposing
        ) {
          event.preventDefault();
          submit();
        }
        if (
          event.key === "Backspace" &&
          event.currentTarget.value === "" &&
          attachments.files.length > 0
        ) {
          event.preventDefault();
          const last = attachments.files.at(-1);
          if (last) attachments.remove(last.id);
        }
      }}
      onInput={(event) => {
        onInput?.(event);
        resize();
      }}
      onPaste={(event) => {
        onPaste?.(event);
        if (event.defaultPrevented) return;
        const files = Array.from(event.clipboardData.items)
          .filter((item) => item.kind === "file")
          .map((item) => item.getAsFile())
          .filter((file): file is File => Boolean(file));
        if (files.length) {
          event.preventDefault();
          attachments.add(files);
        }
      }}
      style={{ minHeight, maxHeight, ...props.style }}
      {...props}
      {...controlledProps}
    />
  );
}

export type TooltipSide = "top" | "right" | "bottom" | "left";

export type PromptInputButtonTooltip =
  | string
  | {
      content: React.ReactNode;
      shortcut?: string;
      side?: TooltipSide;
    };

export type PromptInputTooltipConfig = Exclude<PromptInputButtonTooltip, string>;

export interface PromptInputButtonProps extends Omit<ButtonProps, "children" | "className"> {
  className?: string;
  tooltip?: PromptInputButtonTooltip;
  children?: React.ReactNode;
}

export function PromptInputButton({
  className,
  tooltip,
  variant = "ghost",
  color = "neutral",
  size,
  children,
  "aria-label": ariaLabel,
  ref,
  ...props
}: PromptInputButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const resolvedSize = size ?? (React.Children.count(children) > 1 ? "sm" : "icon");
  const tooltipConfig: PromptInputTooltipConfig | undefined =
    typeof tooltip === "string" ? { content: tooltip } : tooltip;
  const fallbackLabel =
    ariaLabel ?? (typeof tooltipConfig?.content === "string" ? tooltipConfig.content : undefined);
  const button = (
    <Button
      ref={ref}
      type="button"
      variant={variant}
      color={color}
      size={resolvedSize}
      className={cx("prompt-input__button", className)}
      aria-label={fallbackLabel}
      {...props}
    >
      {children}
    </Button>
  );

  if (!tooltipConfig) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipPortal>
        <TooltipPositioner side={tooltipConfig.side} sideOffset={6}>
          <TooltipPopup>
            <span className="prompt-input__tooltip-content">{tooltipConfig.content}</span>
            {tooltipConfig.shortcut ? (
              <kbd className="prompt-input__tooltip-shortcut">{tooltipConfig.shortcut}</kbd>
            ) : null}
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}

export type PromptInputActionMenuProps = MenuProps;

export function PromptInputActionMenu(props: PromptInputActionMenuProps) {
  return <MenuRoot {...props} />;
}

export type PromptInputActionMenuTriggerProps = PromptInputButtonProps;

export function PromptInputActionMenuTrigger({
  className,
  children,
  ...props
}: PromptInputActionMenuTriggerProps) {
  return (
    <MenuTrigger
      render={
        <PromptInputButton className={className} {...props}>
          {children ?? <PlusIcon />}
        </PromptInputButton>
      }
    />
  );
}

export type PromptInputActionMenuContentProps = MenuPopupProps;

export function PromptInputActionMenuContent({
  className,
  children,
  ...props
}: PromptInputActionMenuContentProps) {
  return (
    <MenuPortal>
      <MenuPositioner>
        <MenuPopup className={cx("prompt-input__action-menu", className)} {...props}>
          {children}
        </MenuPopup>
      </MenuPositioner>
    </MenuPortal>
  );
}

export type PromptInputActionMenuItemProps = MenuItemProps;

export function PromptInputActionMenuItem({ className, ...props }: PromptInputActionMenuItemProps) {
  return <MenuItem className={cx("prompt-input__action-menu-item", className)} {...props} />;
}

export interface PromptInputActionAddAttachmentsProps extends PromptInputActionMenuItemProps {
  label?: string;
}

export function PromptInputActionAddAttachments({
  label = "Add photos or files",
  onClick,
  children,
  ...props
}: PromptInputActionAddAttachmentsProps) {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputActionMenuItem
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) attachments.openFileDialog();
      }}
    >
      {children ?? (
        <>
          <ImageIcon className="prompt-input__action-menu-icon" />
          {label}
        </>
      )}
    </PromptInputActionMenuItem>
  );
}

export interface PromptInputActionAddScreenshotProps extends PromptInputActionMenuItemProps {
  label?: string;
}

export function PromptInputActionAddScreenshot({
  label = "Take screenshot",
  onClick,
  children,
  ...props
}: PromptInputActionAddScreenshotProps) {
  const attachments = usePromptInputAttachments();
  return (
    <PromptInputActionMenuItem
      {...props}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        try {
          const screenshot = await captureScreenshot();
          if (screenshot) attachments.add([screenshot]);
        } catch (error) {
          if (
            error instanceof DOMException &&
            (error.name === "NotAllowedError" || error.name === "AbortError")
          ) {
            return;
          }
          throw error;
        }
      }}
    >
      {children ?? (
        <>
          <MonitorIcon className="prompt-input__action-menu-icon" />
          {label}
        </>
      )}
    </PromptInputActionMenuItem>
  );
}

export interface PromptInputSubmitProps extends Omit<
  ButtonProps,
  "children" | "className" | "type"
> {
  className?: string;
  status?: PromptInputStatus;
  onStop?: () => void;
  children?: React.ReactNode;
  label?: string;
}

export function PromptInputSubmit({
  className,
  status = "ready",
  onStop,
  variant = "normal",
  color = "primary",
  size = "icon",
  onClick,
  children,
  label,
  ref,
  ...props
}: PromptInputSubmitProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const isStopping = status === "submitted" || status === "streaming";
  const resolvedLabel = label ?? defaultSubmitLabel(status);

  return (
    <Button
      ref={ref}
      type={isStopping ? "button" : "submit"}
      variant={variant}
      color={color}
      size={size}
      className={cx("prompt-input__submit", className)}
      data-status={status}
      aria-label={resolvedLabel}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (isStopping) {
          event.preventDefault();
          onStop?.();
        }
      }}
      {...props}
    >
      {children ?? defaultSubmitIcon(status)}
    </Button>
  );
}

export type PromptInputSelectProps = SelectProps;
export const PromptInputSelect = Select;

export type PromptInputSelectTriggerProps = SelectTriggerProps;
export function PromptInputSelectTrigger(props: PromptInputSelectTriggerProps) {
  return <SelectTrigger {...props} />;
}

export type PromptInputSelectContentProps = SelectContentProps;
export function PromptInputSelectContent(props: PromptInputSelectContentProps) {
  return (
    <SelectPortal>
      <SelectPositioner>
        <SelectContent {...props} />
      </SelectPositioner>
    </SelectPortal>
  );
}

export type PromptInputSelectItemProps = SelectItemProps;
export const PromptInputSelectItem = SelectItem;

export type PromptInputSelectValueProps = SelectValueProps;
export const PromptInputSelectValue = SelectValue;

interface PromptInputHoverCardContextValue {
  open: boolean;
  openNow: () => void;
  closeLater: () => void;
}

const PromptInputHoverCardContext = React.createContext<PromptInputHoverCardContextValue | null>(
  null,
);

export interface PromptInputHoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  openDelay?: number;
  closeDelay?: number;
}

export function PromptInputHoverCard({
  openDelay = 0,
  closeDelay = 0,
  className,
  children,
  ref,
  ...props
}: PromptInputHoverCardProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [open, setOpen] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  const clearTimer = React.useCallback(() => window.clearTimeout(timer.current), []);
  const openNow = React.useCallback(() => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [clearTimer, openDelay]);
  const closeLater = React.useCallback(() => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpen(false), closeDelay);
  }, [clearTimer, closeDelay]);

  React.useEffect(() => clearTimer, [clearTimer]);

  const value = React.useMemo(() => ({ open, openNow, closeLater }), [closeLater, open, openNow]);
  return (
    <PromptInputHoverCardContext.Provider value={value}>
      <div ref={ref} className={cx("prompt-input__hover-card", className)} {...props}>
        {children}
      </div>
    </PromptInputHoverCardContext.Provider>
  );
}

export interface PromptInputHoverCardTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function PromptInputHoverCardTrigger({
  className,
  ref,
  ...props
}: PromptInputHoverCardTriggerProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const ctx = React.useContext(PromptInputHoverCardContext);
  return (
    <span
      ref={ref}
      className={cx("prompt-input__hover-card-trigger", className)}
      onFocus={ctx?.openNow}
      onBlur={ctx?.closeLater}
      onMouseEnter={ctx?.openNow}
      onMouseLeave={ctx?.closeLater}
      {...props}
    />
  );
}

export interface PromptInputHoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputHoverCardContent({
  className,
  ref,
  ...props
}: PromptInputHoverCardContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const ctx = React.useContext(PromptInputHoverCardContext);
  if (!ctx?.open) return null;
  return (
    <div
      ref={ref}
      className={cx("prompt-input__hover-card-content", className)}
      onMouseEnter={ctx.openNow}
      onMouseLeave={ctx.closeLater}
      {...props}
    />
  );
}

export type PromptInputTabsListProps = React.ComponentPropsWithoutRef<typeof TabsList>;
export const PromptInputTabsList = TabsList;

export type PromptInputTabProps = React.ComponentPropsWithoutRef<typeof Tab>;
export const PromptInputTab = Tab;

export type PromptInputTabBodyProps = React.ComponentPropsWithoutRef<typeof TabPanel>;
export const PromptInputTabBody = TabPanel;

export interface PromptInputTabLabelProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export function PromptInputTabLabel({
  className,
  ref,
  ...props
}: PromptInputTabLabelProps & { ref?: React.Ref<HTMLHeadingElement> }) {
  return <h3 ref={ref} className={cx("prompt-input__tab-label", className)} {...props} />;
}

export interface PromptInputTabItemProps extends React.HTMLAttributes<HTMLDivElement> {}
export function PromptInputTabItem({
  className,
  ref,
  ...props
}: PromptInputTabItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cx("prompt-input__tab-item", className)} {...props} />;
}

export type PromptInputCommandProps = React.ComponentPropsWithoutRef<typeof Combobox>;
export const PromptInputCommand = Combobox;

export type PromptInputCommandInputProps = React.ComponentPropsWithoutRef<typeof ComboboxInput>;
export const PromptInputCommandInput = ComboboxInput;

export interface PromptInputCommandListProps extends React.HTMLAttributes<HTMLDivElement> {}
export function PromptInputCommandList({
  className,
  ref,
  ...props
}: PromptInputCommandListProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ComboboxList ref={ref} className={cx("prompt-input__command-list", className)} {...props} />
  );
}

export type PromptInputCommandEmptyProps = React.ComponentPropsWithoutRef<typeof ComboboxEmpty>;
export const PromptInputCommandEmpty = ComboboxEmpty;

export type PromptInputCommandGroupProps = React.ComponentPropsWithoutRef<typeof ComboboxGroup>;
export const PromptInputCommandGroup = ComboboxGroup;

export type PromptInputCommandItemProps = React.ComponentPropsWithoutRef<typeof ComboboxItem>;
export const PromptInputCommandItem = ComboboxItem;

export type PromptInputCommandSeparatorProps = React.ComponentPropsWithoutRef<
  typeof ComboboxSeparator
>;
export const PromptInputCommandSeparator = ComboboxSeparator;

function defaultSubmitIcon(status: PromptInputStatus) {
  switch (status) {
    case "submitted":
      return <SpinnerIcon className="prompt-input__submit-spinner" />;
    case "streaming":
      return <SquareIcon />;
    case "error":
      return <WarningIcon />;
    default:
      return <ArrowUpIcon />;
  }
}

function defaultSubmitLabel(status: PromptInputStatus) {
  switch (status) {
    case "submitted":
      return "Sending";
    case "streaming":
      return "Stop response";
    case "error":
      return "Retry";
    default:
      return "Send message";
  }
}

function fileToPart(file: File): PromptInputFilePart & { id: string } {
  return {
    id: createId(),
    type: "file",
    filename: file.name,
    mediaType: file.type,
    url: URL.createObjectURL(file),
  };
}

function revokeFileUrls(files: readonly PromptInputFilePart[]) {
  for (const file of files) {
    if (file.url?.startsWith("blob:")) URL.revokeObjectURL(file.url);
  }
}

async function resolveSubmittedFile(
  file: PromptInputFilePart & { id: string },
): Promise<PromptInputFilePart> {
  const { id: _id, ...part } = file;
  if (!part.url?.startsWith("blob:")) return part;
  const dataUrl = await blobUrlToDataUrl(part.url);
  return { ...part, url: dataUrl ?? part.url };
}

async function blobUrlToDataUrl(url: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function captureScreenshot() {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) return null;
  let stream: MediaStream | null = null;
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: true });
    video.srcObject = stream;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load screen stream"));
    });
    await video.play();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height) return null;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return null;
    return new File([blob], `screenshot-${new Date().toISOString().replaceAll(/[:.]/g, "-")}.png`, {
      type: "image/png",
      lastModified: Date.now(),
    });
  } catch {
    return null;
  } finally {
    for (const track of stream?.getTracks() ?? []) track.stop();
    video.pause();
    video.srcObject = null;
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `prompt-input-${Date.now()}-${Math.random()}`;
}
