function initials(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
}

/** A stable hue per name, so the same person always gets the same colour. */
function hue(name) {
  let hash = 0;
  for (const char of String(name)) hash = (hash * 31 + char.codePointAt(0)) % 360;
  return hash;
}

export default function Avatar({ name, size = 28 }) {
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ "--avatar-hue": hue(name), width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}
