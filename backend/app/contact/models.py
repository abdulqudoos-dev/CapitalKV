from odmantic import Model

class ContactForm(Model):
    name: str
    email: str
    message: str
