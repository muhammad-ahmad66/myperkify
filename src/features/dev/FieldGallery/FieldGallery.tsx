'use client';

import {
  AtSign,
  Building2,
  GraduationCap,
  Globe,
  Lock,
  Mail,
  Package,
  Search,
  Store,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import {
  CheckboxField,
  ChoiceCards,
  CodeField,
  ComboboxField,
  DateField,
  FileField,
  FormError,
  NumberField,
  PhoneField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
} from '@/components/ui/form';
import styles from './FieldGallery.module.css';

const BUSINESS_TYPES = [
  { value: 'sole', label: 'Sole proprietor', description: 'You own and run it yourself' },
  { value: 'partnership', label: 'Partnership', description: 'Two or more owners' },
  { value: 'company', label: 'Private limited company', description: 'Registered with SECP' },
  { value: 'franchise', label: 'Franchise', description: 'You run a branch of a brand' },
];

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'];

/** Every field in every state, on one page, for review. Development only. */
export function FieldGallery() {
  const [text, setText] = useState('Crust & Co.');
  const [search, setSearch] = useState('');
  const [about, setAbout] = useState('');
  const [phone, setPhone] = useState('');
  const [bill, setBill] = useState<number | undefined>(1200);
  const [count, setCount] = useState<number | undefined>(2);
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [mode, setMode] = useState('store');
  const [agreed, setAgreed] = useState(false);
  const [notify, setNotify] = useState(true);
  const [code, setCode] = useState('');
  const [file, setFile] = useState<File | null>(null);

  return (
    <main className={styles.page}>
      <h1>Field system</h1>
      <p className={styles.lede}>
        Every field, in every state. This page exists only in development.
      </p>

      <section>
        <h2>Text</h2>
        <div className={styles.grid}>
          <TextField
            label="Business name"
            placeholder="Crust & Co."
            icon={Store}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onClear={() => setText('')}
          />
          <TextField
            label="Search"
            type="search"
            placeholder="Search cafés, gyms, textbooks…"
            icon={Search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch('')}
          />
          <TextField
            label="Email"
            type="email"
            placeholder="name@business.pk"
            icon={Mail}
            valid
            defaultValue="sana@crustandco.pk"
          />
          <TextField
            label="Email"
            type="email"
            placeholder="name@business.pk"
            icon={Mail}
            defaultValue="sana@"
            error="Enter a full email address, like name@business.pk."
          />
          <TextField
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            icon={Lock}
          />
          <TextField
            label="Website"
            type="url"
            optional
            placeholder="https://crustandco.pk"
            icon={Globe}
            hint="Students see this on your store page."
          />
          <TextField label="Instagram" prefix="@" optional placeholder="crustandco" icon={AtSign} />
          <TextField label="Disabled" placeholder="Not available" icon={User} disabled />
        </div>
      </section>

      <section>
        <h2>Numbers and phone</h2>
        <div className={styles.grid}>
          <PhoneField label="Mobile number" value={phone} onChange={setPhone} />
          <NumberField
            label="Average bill"
            prefix="PKR"
            placeholder="1,200"
            value={bill}
            onChange={setBill}
          />
          <NumberField
            label="Number of branches"
            placeholder="1"
            value={count}
            min={1}
            max={20}
            stepper
            onChange={setCount}
          />
          <DateField label="Offer starts" value={date} onChange={setDate} fromDate={new Date()} />
        </div>
      </section>

      <section>
        <h2>Lists</h2>
        <div className={styles.grid}>
          <SelectField
            label="Business type"
            placeholder="Choose a business type"
            icon={Building2}
            options={BUSINESS_TYPES}
            value={type}
            onChange={setType}
          />
          <ComboboxField
            label="City"
            placeholder="Choose your city"
            searchPlaceholder="Search cities"
            emptyText="No city found."
            icon={GraduationCap}
            options={CITIES.map((name) => ({ value: name, label: name }))}
            value={city}
            onChange={setCity}
          />
        </div>
      </section>

      <section>
        <h2>Long text</h2>
        <TextAreaField
          label="About your business"
          placeholder="Wood-fired pizzas in the heart of Gulberg, loved by students since 2019."
          maxLength={280}
          value={about}
          onChange={(event) => setAbout(event.target.value)}
        />
      </section>

      <section>
        <h2>Choices</h2>
        <div className={styles.stack}>
          <ChoiceCards
            label="How do students buy from you?"
            columns={3}
            value={mode}
            onChange={setMode}
            options={[
              {
                value: 'store',
                title: 'In store',
                description: 'Claim at your counter',
                icon: Store,
              },
              { value: 'online', title: 'Online', description: 'You deliver to them', icon: Truck },
              { value: 'both', title: 'Both', description: 'Counter and delivery', icon: Package },
            ]}
          />
          <CheckboxField
            label="I agree to pay 5% commission on completed orders."
            value={agreed}
            onChange={setAgreed}
          />
          <SwitchField
            label="New order emails"
            description="We email you the moment an order comes in."
            value={notify}
            onChange={setNotify}
          />
        </div>
      </section>

      <section>
        <h2>Code and upload</h2>
        <div className={styles.stack}>
          <CodeField label="Verification code" value={code} onChange={setCode} />
          <FileField
            label="Proof of business"
            title="Drop your document here, or browse"
            description="PDF, JPG or PNG, up to 5 MB"
            accept={{
              'application/pdf': ['.pdf'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
            }}
            maxBytes={5 * 1024 * 1024}
            value={file}
            onChange={setFile}
          />
          <FormError>
            We couldn&apos;t send your application. Check your connection and try again.
          </FormError>
        </div>
      </section>
    </main>
  );
}
