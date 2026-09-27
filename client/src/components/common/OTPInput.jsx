import { useRef } from "react";

export default function OTPInput({ value, onChange, length = 4 }) {
  const inputsRef = useRef([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join(""));
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted.padEnd(length, "").slice(0, length).replace(/ /g, ""));
      e.preventDefault();
    }
  };

  return (
    <div className="flex justify-center gap-2 xs:gap-3" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          className="h-12 w-10 rounded-xl border border-slate-300 text-center text-xl font-bold outline-none focus:border-turf-500 focus:ring-2 focus:ring-turf-100 xs:h-14 xs:w-12 xs:text-2xl"
        />
      ))}
    </div>
  );
}
