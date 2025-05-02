import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import GreenderIcon from "@/assets/greender_logo_transparent.png" 
import GreenderLetters from "@/assets/greender_letters.png"

export default function SignIn() {
  const FormSchema = z.object({
    type: z.enum(['credentials', 'google'], {
      required_error: 'Please select an authentication type',
    }),
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  return (
    <main className="flex min-h-screen bg-black">
      <section>
        {/* Here will be selection between credentials and oauth */}
        <Form {...form}>
          <form>
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <img src={GreenderIcon} height="64" width="64" alt="greender icon" />
                  <img src={GreenderLetters} height="128" width="128" alt="greender letters" />
                </FormLabel>
              </FormItem>
            )}/>
          </form>
        </Form>
      </section>
    </main>
  )
}
