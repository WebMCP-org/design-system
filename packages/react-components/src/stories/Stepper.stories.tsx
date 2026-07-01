import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "../components/Stepper";

const meta: Meta<typeof Stepper> = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const setupSteps = [
  {
    id: 1,
    title: "Deploy Nanites",
    description: "Create the Worker and storage.",
    action: "Deployed",
  },
  {
    id: 2,
    title: "Connect Cloudflare",
    description: "Grant deploy access.",
    action: "Connected",
  },
  {
    id: 3,
    title: "Create GitHub App",
    description: "Install the app manifest.",
    action: "In progress",
  },
  {
    id: 4,
    title: "Pick repositories",
    description: "Choose where agents can work.",
    action: "Next",
  },
  {
    id: 5,
    title: "Start Nanites",
    description: "Launch the workspace.",
    action: "Ready",
  },
];

export const Horizontal: Story = {
  render: () => (
    <Stepper defaultValue={2} style={{ width: "720px" }}>
      <StepperNav>
        {setupSteps.slice(0, 4).map((step, index, steps) => (
          <StepperItem key={step.id} step={step.id}>
            <StepperTrigger aria-label={step.title}>
              <StepperIndicator />
              <StepperTitle>{step.title}</StepperTitle>
            </StepperTrigger>
            {index < steps.length - 1 ? <StepperSeparator /> : null}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  ),
};

export const SetupFlow: Story = {
  render: () => (
    <Stepper value={3} orientation="vertical" style={{ width: "520px" }}>
      <StepperNav aria-label="Nanites setup steps">
        {setupSteps.map((step, index) => (
          <StepperItem
            key={step.id}
            step={step.id}
            completed={step.id < 3}
            disabled={step.id > 3}
            loading={step.id === 3}
          >
            <StepperTrigger>
              <StepperIndicator />
              <span style={{ display: "grid", gap: "0.125rem" }}>
                <StepperTitle>{step.title}</StepperTitle>
                <StepperDescription>{step.description}</StepperDescription>
              </span>
              <Badge
                color={step.id < 3 ? "success" : step.id === 3 ? "primary" : "neutral"}
                size="sm"
                style={{ marginInlineStart: "auto" }}
              >
                {step.action}
              </Badge>
            </StepperTrigger>
            {index < setupSteps.length - 1 ? <StepperSeparator /> : null}
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  ),
};

export const ControlledPanels: Story = {
  render: () => {
    const [step, setStep] = React.useState(1);
    const active = setupSteps.find((item) => item.id === step) ?? setupSteps[0];

    return (
      <Stepper value={step} onValueChange={setStep} style={{ width: "520px" }}>
        <StepperNav aria-label="Setup">
          {setupSteps.slice(0, 4).map((item, index, steps) => (
            <StepperItem key={item.id} step={item.id}>
              <StepperTrigger aria-label={item.title}>
                <StepperIndicator />
              </StepperTrigger>
              {index < steps.length - 1 ? <StepperSeparator /> : null}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel
          style={{
            padding: "1rem",
            border: "1px solid var(--sigvelo-color-neutral-border-muted)",
            borderRadius: "var(--sigvelo-radius-md)",
            backgroundColor: "var(--sigvelo-color-surface)",
          }}
        >
          {setupSteps.slice(0, 4).map((item) => (
            <StepperContent key={item.id} value={item.id}>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      color: "var(--sigvelo-color-text)",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      margin: "0.25rem 0 0",
                      color: "var(--sigvelo-color-text-muted)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
                  <Button
                    color="neutral"
                    variant="outline"
                    disabled={step === 1}
                    onClick={() => setStep((currentStep) => Math.max(1, currentStep - 1))}
                  >
                    Back
                  </Button>
                  <Button
                    disabled={step === 4}
                    onClick={() => setStep((currentStep) => Math.min(4, currentStep + 1))}
                  >
                    {active.id === 4 ? "Done" : "Continue"}
                  </Button>
                </div>
              </div>
            </StepperContent>
          ))}
        </StepperPanel>
      </Stepper>
    );
  },
};
