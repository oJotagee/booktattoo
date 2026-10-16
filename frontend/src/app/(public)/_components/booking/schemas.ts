import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { bookingSchema, type BookingSchemaData } from './booking-schema';

export { bookingSchema, type BookingSchemaData };

export function useBookingSchema() {
  return useForm<BookingSchemaData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
    defaultValues: {
      date: '',
      time: '',
      name: '',
      email: '',
      phone: '',
    },
  });
}
