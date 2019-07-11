import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale';
import Mail from '../../libs/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { user, meetup } = data;

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Inscrição confirmada!',
      template: 'subscription',
      context: {
        subscriber: user.name,
        name: meetup.name,
        date: format(
          parseISO(meetup.date),
          "'dia' dd 'de' MMMM 'às' HH'h'mm'min'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new SubscriptionMail();
