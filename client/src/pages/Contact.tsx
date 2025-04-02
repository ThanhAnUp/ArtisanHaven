import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(2, { message: 'Subject is required' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  // Submit mutation
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      toast({
        title: 'Message sent!',
        description: 'We have received your message and will get back to you soon.',
      });
      setIsSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to send message: ${error}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  return (
    <div className="bg-neutral-light min-h-screen">
      {/* Contact Header */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-semibold mb-6">Contact Us</h1>
            <p className="text-lg">
              Have questions about our products or need assistance? We're here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="inline-block p-4 bg-secondary rounded-full text-primary text-3xl mb-4">
                <i className="bx bx-map"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">Visit Us</h3>
              <p className="text-muted-foreground">
                123 Artisan Street<br />
                Craftville, CA 90210<br />
                United States
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="inline-block p-4 bg-secondary rounded-full text-primary text-3xl mb-4">
                <i className="bx bx-envelope"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">Email Us</h3>
              <p className="text-muted-foreground">
                info@artisanhaven.com<br />
                support@artisanhaven.com
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="inline-block p-4 bg-secondary rounded-full text-primary text-3xl mb-4">
                <i className="bx bx-phone"></i>
              </div>
              <h3 className="text-xl font-medium mb-2">Call Us</h3>
              <p className="text-muted-foreground">
                +1 (555) 123-4567<br />
                Monday-Friday: 9am-6pm
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Map or Image */}
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1570126618953-d437176e8c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Artisan Haven storefront" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Contact Form */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-heading font-semibold mb-6">Send Us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="text-5xl text-primary mb-4">
                    <i className="bx bx-check-circle"></i>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We will get back to you as soon as possible.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What is this about?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your message..." 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 font-accent"
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-semibold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid gap-6">
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Do you ship internationally?</h3>
                <p className="text-muted-foreground">
                  Yes, we ship to most countries worldwide. Shipping rates and delivery times vary by location. 
                  You can view shipping options at checkout.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">What is your return policy?</h3>
                <p className="text-muted-foreground">
                  We accept returns within 30 days of delivery. Items must be in original condition 
                  with tags attached. Custom orders are not eligible for return.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">How can I track my order?</h3>
                <p className="text-muted-foreground">
                  Once your order ships, you will receive a confirmation email with tracking information. 
                  You can also track your order in your account dashboard.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Are your products really handmade?</h3>
                <p className="text-muted-foreground">
                  Absolutely! Each item is handcrafted by skilled artisans using traditional techniques. 
                  That's why each piece may have slight variations that make it unique.
                </p>
              </div>
              
              <div className="bg-neutral-light p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-2">How can I become an artisan partner?</h3>
                <p className="text-muted-foreground">
                  We're always looking for talented artisans to join our community. Please send an email to 
                  partners@artisanhaven.com with photos of your work and a brief description of your craft.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
