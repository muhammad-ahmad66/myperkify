import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Wrap } from '@/components/ui/Wrap';
import { ROUTES } from '@/lib/routes';
import { HERO_TILES } from '../../content';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <Wrap className={styles.copy}>
        <h1 className={styles.title}>
          <span>Show your phone.</span>{' '}
          <span>
            Pay the <em>student price.</em>
          </span>
        </h1>
        <p className={styles.sub}>Real discounts at cafés, gyms and bookshops across Pakistan.</p>
        <div className={styles.actions}>
          <ButtonLink href={ROUTES.getVerified} size="lg">
            Get verified, it&apos;s free
            <Icon icon={ArrowRight} size={16} />
          </ButtonLink>
          <ButtonLink href={ROUTES.deals} size="lg" variant="ghost">
            Browse deals
          </ButtonLink>
        </div>
      </Wrap>

      <div className={styles.fan}>
        {HERO_TILES.map((tile) => (
          <figure key={tile.src} className={styles.tile}>
            <span className={styles.photo}>
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                priority={tile.main}
                sizes={
                  tile.main ? '(max-width: 760px) 60vw, 380px' : '(max-width: 760px) 40vw, 280px'
                }
              />
            </span>
            <figcaption className={styles.caption}>
              {tile.offer ? (
                <>
                  <b>{tile.offer}</b> {tile.label}
                </>
              ) : (
                tile.caption
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
