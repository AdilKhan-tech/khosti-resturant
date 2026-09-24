const tabButtonClass = (isActive) =>
  [
    "btn",
    "bg-transparent",
    "rounded-0",
    "px-0",
    "pb-2",
    "fw-semibold",
    "border-0",
    isActive ? "text-orange" : "fnt-color",
  ].join(" ");

const activeTabStyle = (isActive) =>
  isActive
    ? { borderBottom: "2px solid #ff7900", color: "#ff7900" }
    : { borderBottom: "2px solid transparent" };

export default function AccessControlTabs({ activeKey, onChange, tabs, className = "" }) {
  return (
    <div className={`d-flex gap-4 border-bottom ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            className={tabButtonClass(isActive)}
            style={activeTabStyle(isActive)}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

