import { Plus } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import styles from './FaqList.module.css';

type FaqListProps = {
  faqs: { question: string; answer: string }[];
};

export function FaqList({ faqs }: FaqListProps) {
  return (
    <div className={styles.list}>
      {faqs.map((faq, index) => (
        <details key={faq.question} open={index === 0}>
          <summary>
            {faq.question}
            <Icon icon={Plus} />
          </summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
