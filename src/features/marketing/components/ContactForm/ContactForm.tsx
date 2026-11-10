'use client';

import { Mail, User } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { TextAreaField, TextField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api/client';
import styles from './ContactForm.module.css';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.'),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a full email address.')),
  message: z.string().trim().min(10, 'Tell us a little more so we can help.'),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const send = useMutation({
    mutationFn: (values: ContactValues) => api.post('/contact', values),
    onSuccess: () => {
      toast.success('Message sent');
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((values) => send.mutate(values, { onSuccess: () => reset() }))}
      noValidate
    >
      <TextField
        label="Your name"
        placeholder="Ayesha Khan"
        icon={User}
        error={errors.name?.message}
        id="contact-name"
        {...register('name')}
      />
      <TextField
        label="Email"
        placeholder="you@example.com"
        icon={Mail}
        error={errors.email?.message}
        id="contact-email"
        type="email"
        {...register('email')}
      />
      <TextAreaField
        label="Message"
        placeholder="Tell us what you need help with."
        error={errors.message?.message}
        id="contact-message"
        rows={5}
        {...register('message')}
      />
      <Button type="submit" size="lg" block loading={send.isPending}>
        {send.isPending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
