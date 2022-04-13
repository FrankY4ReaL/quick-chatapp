from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, EqualTo, ValidationError

# Create Registration Form
class RegistrationForm(FlaskForm):
    username = StringField('username_label', validators=[InputRequired(message='Username Required'),Length(min=4, max=20,message='Username must be between 4 and 20 characters')],
                           render_kw={'autofocus': True})
    password = PasswordField('password_label',
                             validators=[InputRequired(message='Password required'), Length(min=4, max=20,message='Password must be between 4 and 20 characters')])
    confirm_password = PasswordField("confirm_password_label", validators=[InputRequired(message='Confirm your password'),EqualTo('password', message='Password must match')])


# Create Login Form
class LoginForm(FlaskForm):
    username = StringField('username_label', validators=[InputRequired()])
    password = PasswordField('password_label', validators=[InputRequired()])
