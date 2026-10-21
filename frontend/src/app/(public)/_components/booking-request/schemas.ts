import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { bookingRequestSchema, type BookingRequestSchemaData } from './booking-request-schema';

export { bookingRequestSchema, type BookingRequestSchemaData };

export function useBookingRequestSchema() {
  return useForm<BookingRequestSchemaData>({
    resolver: zodResolver(bookingRequestSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });
}
