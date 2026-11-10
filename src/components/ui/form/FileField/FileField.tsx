'use client';

import clsx from 'clsx';
import { FileText, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { Icon } from '../../Icon';
import { FieldMessage, useFieldIds } from '../FieldShell';
import styles from './FileField.module.css';

type FileFieldProps = {
  label: string;
  /** The line under the title, such as "JPG or PNG, up to 5 MB". */
  description: string;
  title?: string;
  accept: Accept;
  maxBytes: number;
  value?: File | null;
  id?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Upload progress from 0 to 100, while sending. */
  progress?: number;
  onChange?: (file: File | null) => void;
  /** Use a custom check, and return a message to reject the file. */
  validate?: (file: File) => string | null;
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function rejectionMessage(rejection: FileRejection, maxBytes: number): string {
  const code = rejection.errors[0]?.code;
  if (code === 'file-too-large') {
    return `That file is over ${formatSize(maxBytes)}. Try a smaller one.`;
  }
  return 'That file type is not supported.';
}

/** Drag and drop or browse, with a preview, replace and remove. */
export function FileField({
  label,
  description,
  title = 'Drop a file here, or browse',
  accept,
  maxBytes,
  value,
  id,
  error,
  hint,
  optional,
  progress,
  onChange,
  validate,
}: FileFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);
  const [rejected, setRejected] = useState<string>();
  const previewUrl = useMemo(
    () => (value?.type.startsWith('image/') ? URL.createObjectURL(value) : null),
    [value],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    maxSize: maxBytes,
    multiple: false,
    noClick: Boolean(value),
    noKeyboard: Boolean(value),
    onDropAccepted: ([file]) => {
      if (!file) return;
      const problem = validate?.(file) ?? null;
      setRejected(problem ?? undefined);
      if (!problem) onChange?.(file);
    },
    onDropRejected: ([rejection]) => {
      if (rejection) setRejected(rejectionMessage(rejection, maxBytes));
    },
  });

  const shownError = rejected ?? error;

  return (
    <div className={styles.root}>
      <span className={styles.label}>
        {label}
        {optional && <span className={styles.optional}>Optional</span>}
      </span>

      <div
        {...getRootProps({
          className: clsx(
            styles.zone,
            isDragActive && styles.over,
            value && styles.picked,
            shownError && styles.bad,
          ),
        })}
      >
        <input {...getInputProps({ id: fieldId, 'aria-label': label })} />
        {value ? (
          <>
            {previewUrl ? (
              // A local blob preview, which next/image cannot optimise.
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.thumb} src={previewUrl} alt="" />
            ) : (
              <span className={styles.docIcon}>
                <Icon icon={FileText} size={22} />
              </span>
            )}
            <span className={styles.file}>
              <b>{value.name}</b>
              <small>{formatSize(value.size)}</small>
              {progress !== undefined && (
                <span
                  className={styles.progress}
                  role="progressbar"
                  aria-label="Uploading"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <i style={{ width: `${progress}%` }} />
                </span>
              )}
            </span>
            <button
              type="button"
              className={styles.action}
              aria-label="Replace file"
              onClick={open}
            >
              <Icon icon={RefreshCw} size={16} />
            </button>
            <button
              type="button"
              className={styles.action}
              aria-label="Remove file"
              onClick={() => onChange?.(null)}
            >
              <Icon icon={Trash2} size={16} />
            </button>
          </>
        ) : (
          <>
            <span className={styles.uploadIcon}>
              <Icon icon={UploadCloud} size={24} />
            </span>
            <span className={styles.prompt}>
              <b>{isDragActive ? 'Drop it here' : title}</b>
              <small>{description}</small>
            </span>
          </>
        )}
      </div>

      <FieldMessage id={messageId} error={shownError} hint={hint} />
    </div>
  );
}
