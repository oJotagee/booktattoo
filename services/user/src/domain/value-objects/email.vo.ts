import { InvalidEmailError } from "../errors/email.error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EmailProps = {
  value: string;
};

export class Email {
  private constructor(private readonly props: EmailProps) {
    if (!props.value.trim()) throw new InvalidEmailError('E-mail deve ser fornecido.');
    if (!EMAIL_REGEX.test(props.value)) throw new InvalidEmailError('E-mail é inválido.');
  }

  get value(): string {
    return this.props.value;
  }

  static create(input: EmailProps): Email {
    return new Email({
      value: input.value.trim(),
    });
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): EmailProps {
    return {
      value: this.value,
    };
  }
}
