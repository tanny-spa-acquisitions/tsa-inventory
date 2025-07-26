import { AuthContext } from "@/contexts/authContext";
import { appTheme } from "@/util/appTheme";
import { useContext } from "react";
import {
  FieldValues,
  Path,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
import DatePicker from "react-datepicker";
import { IoClose } from "react-icons/io5";

const TextField = <T extends FieldValues>({
  inputType,
  label,
  name,
  inputMode,
  pattern,
  register,
  registerOptions,
  error,
  disabled = false,
  className,
  inputStyle,
  rows = 3,
  onInput,
  options,
  selected,
  onChange,
  onCancel,
}: {
  inputType: "input" | "textarea" | "dropdown" | "date";
  label: string;
  name: Path<T>;
  inputMode?: "text" | "numeric" | "decimal";
  pattern?: string;
  register: UseFormRegister<T>;
  registerOptions?: RegisterOptions<T, Path<T>>;
  error?: string;
  disabled?: boolean;
  className?: string;
  inputStyle?: React.CSSProperties;
  rows?: number;
  onInput?: React.InputHTMLAttributes<HTMLInputElement>["onInput"];
  options?: string[];
  selected?: Date | undefined
  onChange?: (date: Date | null) => void;
  onCancel?: () => void;
}) => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) return null;

  return (
    <div className={className}>
      <label className="block font-[400]">{label}</label>
      {inputType === "input" ? (
        <input
          {...register(name, registerOptions)}
          type={"text"}
          inputMode={inputMode}
          pattern={pattern}
          onInput={onInput}
          disabled={disabled}
          className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
          style={{
            ...inputStyle,
            border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
          }}
        />
      ) : inputType === "textarea" ? (
        <textarea
          {...register(name)}
          className="resize-none input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
          disabled={disabled}
          style={{
            ...inputStyle,
            border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
          }}
          rows={rows}
        />
      ) : inputType === "dropdown" ? (
        <select
          {...register(name)}
          className="input rounded-[7px] w-[100%] mt-[6px] px-[6px] py-[4px]"
          style={{
            ...inputStyle,
            border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
          }}
        >
          {options &&
            options.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
      ) : inputType === "date" ? (
        <div className="flex flex-row gap-[10px] mt-[6px]">
          <div
            className="rounded-[8px] w-fit"
            style={{
              border: `0.5px solid ${appTheme[currentUser.theme].text_1}`,
            }}
          >
            <DatePicker
              selected={selected}
              onChange={onChange}
              className="input w-[100%] h-[100%] px-[8px] py-[7px]"
              placeholderText="Select Date"
            />
          </div>

          {selected && (
            <div
              onClick={onCancel}
              style={{
                backgroundColor: appTheme[currentUser.theme].background_3,
              }}
              className="flex items-center justify-center w-[34.5px] h-[34px] pb-[0.5px] pr-[0.5px] rounded-[6px] cursor-pointer dim hover:brightness-75"
            >
              <IoClose
                color={appTheme[currentUser.theme].background_1}
                size={29}
              />
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
      {error && <p className="text-red-500 text-sm mt-[10px]">{error}</p>}
    </div>
  );
};

export default TextField;
