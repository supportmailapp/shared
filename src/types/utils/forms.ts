import { ComponentType, TextInputStyle } from "discord-api-types/v10";

export type ModalComponentType =
  ComponentType.TextInput | ComponentType.TextDisplay | ComponentType.StringSelect | ComponentType.FileUpload;

type IBaseFormComponent<T extends ModalComponentType> = {
  /**
   * The type of the component.
   */
  type: T;
  /**
   * The label of the form field.
   *
   * Max. chars: 45
   */
  label: string;
  /**
   * A random unqiue identifier for the component. Default should to a snowflake-like string.
   */
  id: string;
  /**
   * Whether the component is required or not.
   */
  required?: boolean;
  /**
   * The description of the form field.
   *
   * Max. chars: 100
   */
  description?: string;
  /**
   * The placeholder text for the component.
   */
  placeholder: string;
};

export interface ITextDisplayComponent extends Pick<IBaseFormComponent<ComponentType.TextDisplay>, "id" | "type"> {
  content: string;
}

export interface ITextInputComponent extends IBaseFormComponent<ComponentType.TextInput> {
  style: TextInputStyle;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
}

export interface IBaseSelectMenuComponent<T extends ModalComponentType> extends IBaseFormComponent<T> {
  minValues?: number;
  maxValues?: number;
}

export interface IStringSelectComponent extends IBaseSelectMenuComponent<ComponentType.StringSelect> {
  options: IStringSelectOption[];
}

export interface IStringSelectOption {
  /**
   * Automatically applied by monogdb.
   */
  _id: string;
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  default?: boolean;
}

export interface ClientStringSelectOption extends IStringSelectOption {
  local?: true;
}

export interface IFileUploadComponent extends Omit<IBaseFormComponent<ComponentType.FileUpload>, "placeholder"> {
  /**
   * The label sent in the file thread along with their respective file(s).
   *
   * Max. chars: 100
   *
   * Example: "Evidence Upload"
   *
   * 3 Uploads:
   * - file1.png - 2MB
   * - file2.jpg - 3MB
   * - file3.mp4 - 7MB
   *
   * Total Size: 12MB
   *
   * Messages:
   * 1. Evidence Upload - file1.png, file2.jpg
   * 2. Evidence Upload - file3.mp4 (because it would exceed the size limit if added to message 1)
   *
   * ---
   *
   * If not set or empty, `this.label` of the field will be used instead.
   */
  messageLabel?: string;
  /**
   * Represents `minFiles` for the file upload component.
   */
  minValues?: number;
  /**
   * Represents `maxFiles` for the file upload component.
   */
  maxValues?: number;
}

export type IFormComponent =
  ITextDisplayComponent | ITextInputComponent | IStringSelectComponent | IFileUploadComponent;

export type AnyAPIFormComponent = IFormComponent & { _id?: string; local?: true };
export type AnyAPIFeedbackFormComponent = Exclude<AnyAPIFormComponent, { type: ComponentType.FileUpload }>;

/**
 * API Form Component with local flag
 *
 * local means, the `id` needs to be replaced with a new generated snowflake on the server.
 */
export type APIFormComponent<T extends ComponentType> = Extract<AnyAPIFormComponent, { type: T }>;

export type FormComponentKeys =
  | keyof ITextDisplayComponent
  | keyof ITextInputComponent
  | keyof IStringSelectComponent
  | keyof IFileUploadComponent;
