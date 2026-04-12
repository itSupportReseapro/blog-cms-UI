"use client";
import "./timeline.css";

export default function CmsTimeline({ currentStep }) {
  const steps = [
    { id: 1, label: "Blog Details" },
    { id: 2, label: "Write your Blog" },
  ];

  return (
    <div className="cms-timeline">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="cms-step">
            <div
              className={`cms-circle ${
                isActive ? "active" : ""
              } ${isCompleted ? "completed" : ""}`}
            >
              {step.id}
            </div>

            <p className="cms-label">{step.label}</p>

            {index !== steps.length - 1 && (
              <div
                className={`cms-line ${
                  isCompleted ? "completed" : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}