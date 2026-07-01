import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Field } from "../components/Field";
import { Form } from "../components/Form";
import { Button } from "../components/Button";

const meta = {
  title: "Components/Field",
  component: Field.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Field.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>Username</Field.Label>
        <Field.Control placeholder="Enter username" />
      </Field.Root>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" placeholder="you@example.com" />
        <Field.Description>We'll never share your email with anyone.</Field.Description>
      </Field.Root>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>
          Name <span style={{ color: "var(--sigvelo-color-danger-bg)" }}>*</span>
        </Field.Label>
        <Field.Control required placeholder="Enter your name" />
        <Field.Error match="valueMissing">Name is required</Field.Error>
      </Field.Root>
    </div>
  ),
};

export const EmailValidation: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required placeholder="you@example.com" />
        <Field.Error match="valueMissing">Email is required</Field.Error>
        <Field.Error match="typeMismatch">Please enter a valid email address</Field.Error>
        <Field.Description>Enter your work email</Field.Description>
      </Field.Root>
    </div>
  ),
};

export const PasswordWithMinLength: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>Password</Field.Label>
        <Field.Control type="password" required minLength={8} placeholder="Enter password" />
        <Field.Error match="valueMissing">Password is required</Field.Error>
        <Field.Error match="tooShort">Password must be at least 8 characters</Field.Error>
        <Field.Description>Must be at least 8 characters long</Field.Description>
      </Field.Root>
    </div>
  ),
};

export const PatternValidation: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>Phone Number</Field.Label>
        <Field.Control
          type="tel"
          required
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          placeholder="123-456-7890"
        />
        <Field.Error match="valueMissing">Phone number is required</Field.Error>
        <Field.Error match="patternMismatch">Please use format: 123-456-7890</Field.Error>
      </Field.Root>
    </div>
  ),
};

export const NumberRange: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>Age</Field.Label>
        <Field.Control type="number" required min={18} max={120} placeholder="Enter your age" />
        <Field.Error match="valueMissing">Age is required</Field.Error>
        <Field.Error match="rangeUnderflow">You must be at least 18</Field.Error>
        <Field.Error match="rangeOverflow">Please enter a valid age</Field.Error>
      </Field.Root>
    </div>
  ),
};

export const CustomValidation: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root
        validate={(value) => {
          const reserved = ["admin", "root", "system"];
          if (reserved.includes(String(value).toLowerCase())) {
            return "This username is reserved";
          }
          return null;
        }}
      >
        <Field.Label>Username</Field.Label>
        <Field.Control required placeholder="Choose a username" />
        <Field.Error match="valueMissing">Username is required</Field.Error>
        <Field.Error>This username is reserved</Field.Error>
        <Field.Description>Cannot be admin, root, or system</Field.Description>
      </Field.Root>
    </div>
  ),
};

export const ValidateOnBlur: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root validationMode="onBlur">
        <Field.Label>Email</Field.Label>
        <Field.Control type="email" required placeholder="you@example.com" />
        <Field.Error match="valueMissing">Email is required</Field.Error>
        <Field.Error match="typeMismatch">Please enter a valid email</Field.Error>
        <Field.Description>Validation triggers when you leave the field</Field.Description>
      </Field.Root>
    </div>
  ),
};

export const ValidateOnChange: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root validationMode="onChange" validationDebounceTime={300}>
        <Field.Label>Username</Field.Label>
        <Field.Control required minLength={3} placeholder="At least 3 characters" />
        <Field.Error match="valueMissing">Username is required</Field.Error>
        <Field.Error match="tooShort">Username must be at least 3 characters</Field.Error>
        <Field.Description>Validation triggers as you type (debounced 300ms)</Field.Description>
      </Field.Root>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root disabled>
        <Field.Label>Disabled Field</Field.Label>
        <Field.Control placeholder="Cannot edit this" />
        <Field.Description>This field is disabled</Field.Description>
      </Field.Root>
    </div>
  ),
};

export const WithValidity: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <Field.Root>
        <Field.Label>Password</Field.Label>
        <Field.Control type="password" required minLength={8} />
        <Field.Validity>
          {(state) => (
            <ul
              style={{
                margin: "0.5rem 0 0",
                padding: "0 0 0 1.25rem",
                fontSize: "0.75rem",
                color: "var(--sigvelo-color-text-muted)",
              }}
            >
              <li
                style={{
                  color: state.validity.valueMissing ? "var(--sigvelo-color-danger-bg)" : "inherit",
                }}
              >
                Required
              </li>
              <li
                style={{
                  color: state.validity.tooShort ? "var(--sigvelo-color-danger-bg)" : "inherit",
                }}
              >
                At least 8 characters
              </li>
            </ul>
          )}
        </Field.Validity>
      </Field.Root>
    </div>
  ),
};

export const FormExample: Story = {
  render: function FormExample() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    };

    return (
      <Form onFormSubmit={handleSubmit} style={{ width: "320px" }}>
        <Field.Root name="name">
          <Field.Label>
            Name <span style={{ color: "var(--sigvelo-color-danger-bg)" }}>*</span>
          </Field.Label>
          <Field.Control required placeholder="John Doe" />
          <Field.Error match="valueMissing">Name is required</Field.Error>
        </Field.Root>

        <Field.Root name="email">
          <Field.Label>
            Email <span style={{ color: "var(--sigvelo-color-danger-bg)" }}>*</span>
          </Field.Label>
          <Field.Control type="email" required placeholder="john@example.com" />
          <Field.Error match="valueMissing">Email is required</Field.Error>
          <Field.Error match="typeMismatch">Please enter a valid email</Field.Error>
        </Field.Root>

        <Field.Root name="company">
          <Field.Label>Company</Field.Label>
          <Field.Control placeholder="Acme Inc." />
          <Field.Description>Optional</Field.Description>
        </Field.Root>

        <Field.Root name="password">
          <Field.Label>
            Password <span style={{ color: "var(--sigvelo-color-danger-bg)" }}>*</span>
          </Field.Label>
          <Field.Control
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
          <Field.Error match="valueMissing">Password is required</Field.Error>
          <Field.Error match="tooShort">Password must be at least 8 characters</Field.Error>
        </Field.Root>

        <Button type="submit" color="primary" style={{ marginTop: "0.5rem" }}>
          {submitted ? "Submitted!" : "Create Account"}
        </Button>
      </Form>
    );
  },
};

export const TanStackForm: Story = {
  render: function TanStackForm() {
    const [submitted, setSubmitted] = useState<{ email: string; username: string } | null>(null);
    const form = useForm({
      defaultValues: {
        email: "",
        username: "",
      },
      onSubmit: ({ value }) => {
        setSubmitted(value);
      },
    });

    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        style={{ width: "360px" }}
      >
        <Field.Set>
          <Field.Legend>TanStack Form</Field.Legend>
          <Field.Group>
            <form.Field
              name="email"
              validators={{
                onBlur: ({ value }) => {
                  if (!value) return "Email is required";
                  if (!/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email address";
                  return undefined;
                },
              }}
            >
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field.Root data-invalid={isInvalid}>
                    <Field.Label htmlFor={field.name}>Email</Field.Label>
                    <Field.Control
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    <Field.Description>Validated by TanStack Form on blur.</Field.Description>
                    {isInvalid && <Field.Error errors={field.state.meta.errors} />}
                  </Field.Root>
                );
              }}
            </form.Field>

            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) => {
                  if (value.length < 3) return "Username must be at least 3 characters";
                  return undefined;
                },
              }}
            >
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field.Root data-invalid={isInvalid}>
                    <Field.Label htmlFor={field.name}>Username</Field.Label>
                    <Field.Control
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="mcp-builder"
                      autoComplete="username"
                    />
                    {isInvalid && <Field.Error errors={field.state.meta.errors} />}
                  </Field.Root>
                );
              }}
            </form.Field>
          </Field.Group>

          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" color="primary" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Create Account"}
              </Button>
            )}
          </form.Subscribe>

          {submitted ? (
            <Field.Description>
              Submitted {submitted.email} as {submitted.username}
            </Field.Description>
          ) : null}
        </Field.Set>
      </form>
    );
  },
};
