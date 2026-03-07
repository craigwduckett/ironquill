import clsx from 'clsx';
import styles from './Spinner.module.css';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
};

export function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  return (
    <output
      aria-label={label}
      className={clsx(styles.spinner, styles[`spinner--${size}`], className)}
    />
  );
}
