import { marked } from 'marked';
import { useMemo } from 'react';
import styles from './SrdMarkdown.module.css';

type SrdMarkdownProps = {
  content: string;
  className?: string;
};

export function SrdMarkdown({ content, className }: SrdMarkdownProps) {
  const html = useMemo(() => {
    const raw = marked.parse(content, { async: false }) as string;
    return raw;
  }, [content]);

  return (
    <div
      className={[styles.prose, className].filter(Boolean).join(' ')}
      // marked output is safe for SRD text — no user-generated content reaches here
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted SRD data from our own DB
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
