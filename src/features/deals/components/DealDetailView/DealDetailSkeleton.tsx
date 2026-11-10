import { Skeleton } from '@/components/ui/Skeleton';
import { Wrap } from '@/components/ui/Wrap';
import styles from './DealDetailSkeleton.module.css';

export function DealDetailSkeleton() {
  return (
    <main aria-busy="true">
      <Wrap className={styles.grid}>
        <div className={styles.column}>
          <Skeleton className={styles.cover} />
          <Skeleton className={styles.title} />
          <Skeleton className={styles.line} />
        </div>
        <Skeleton className={styles.panel} />
      </Wrap>
    </main>
  );
}
