import clsx from 'clsx';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './FormField.module.css';

type BaseFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  id: string;
};

type InputFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input';
  };

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea';
  };

type FormFieldProps = InputFieldProps | TextareaFieldProps;

export function FormField(props: FormFieldProps) {
  const { label, error, hint, required, id, as: asEl = 'input', className, ...rest } = props;
  const hasError = Boolean(error);

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>

      {asEl === 'textarea' ? (
        <textarea
          id={id}
          className={clsx(styles.textarea, hasError && styles['textarea--error'], className)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={hasError}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className={clsx(styles.input, hasError && styles['input--error'], className)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={hasError}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <span id={`${id}-error`} role="alert" className={styles.error}>
          {error}
        </span>
      )}
      {hint && !error && (
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}
