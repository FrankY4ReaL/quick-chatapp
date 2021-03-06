from flask import Flask, render_template, redirect, url_for, flash
from wt_formfields import RegistrationForm, LoginForm
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, current_user, login_required, logout_user
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from time import localtime, strftime
import os

app = Flask(__name__)
app.secret_key = 'randomsecretkey'

# initialize SocketIO
socketio = SocketIO(app)
ROOMS = ['lounge', 'news', 'games', 'coding']

'''
 for herkou deployment
# app.secret_key = os.environ.get('SECRET_KEY')

# uri = os.environ.get('DATABASE_URL')
# if uri and uri.startswith("postgres://"):
#     uri = uri.replace("postgres://", "postgresql://", 1)
# app.config[
#     'SQLALCHEMY_DATABASE_URI'] = uri
'''

# for local databse
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


''' Usermixin tells flask login about the user and adds properties like is_authenticated and get_id etc
to the User table to handle session management. '''
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)


# creates user table
db.create_all()

# Initialize Login manager
login = LoginManager(app)
login.init_app(app)


# we need to load the user in whenever any user logs in.It returns that user object
@login.user_loader
def load_user(id):
    return User.query.get(int(id))


@app.route('/', methods=['GET', 'POST'])
def index():
    """
    First page to load, handles user registartion
    """
    reg_form = RegistrationForm()
    if reg_form.validate_on_submit():
        username = reg_form.username.data
        password = reg_form.password.data
        if User.query.filter_by(username=username).first():
            flash('User already exists. Please choose a different name', 'danger')
            return redirect(url_for('index'))
        updated_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
        new_user = User(username=username, password=updated_password)
        db.session.add(new_user)
        db.session.commit()
        flash('Registered Successfully. Please login', 'success')  # this is displayed login page
        return redirect(url_for('login'))

    return render_template('index.html', form=reg_form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handles user login process
    """
    login_form = LoginForm()
    if login_form.validate_on_submit():
        username = login_form.username.data
        password = login_form.password.data
        user = User.query.filter_by(username=username).first()
        if not user:
            flash('User doesnt exists. Please Register', 'danger')
            return redirect(url_for('index'))
        if not check_password_hash(user.password, password):
            flash('Incorrect Password', 'danger')
            return redirect(url_for('login'))
        login_user(user)
        # current user is proxy for user that is accessing that page
        # is authenticated check credentials
        flash('Logged in Successfully')
        return redirect(url_for('chat'))

    return render_template('login.html', form=login_form)


@app.route('/chat', methods=['GET', 'POST'])
@login_required
def chat():
    """
    renders chat page
    """
    return render_template('chat.html', username=current_user.username, rooms=ROOMS)


@app.route('/logout', methods=['GET'])
@login_required
def logout():
    """
    logs user out
    """
    logout_user()
    flash('You logged out successfully', 'success')
    return redirect(url_for('login'))

# test whether client is connected
@socketio.on('connect')
def test():
    print(' client connected')


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


# custom bucket receives message from client
@socketio.on('incoming-message')
def message(data):
    """
    gets data from the client and sends it to all clients according to room
    """

    send({'msg': data['msg'], 'username': data['username'],
          'time_stamp': strftime('%b-%d %I:%m%p', localtime())}, broadcast=True, room=data['room'])


@socketio.on('join')
def join(data):
    """
    handles room joining event of client
    """
    join_room(data['room'])
    send({'msg': data['username'] + ' just joined the ' + data['room'] + ' room'}, room=data['room'])


@socketio.on('leave')
def leave(data):
    """
    handles room leaving process of client
    """
    leave_room(data['room'])
    send({'msg': data['username'] + 'has left  the ' + data['room'] + ' room'}, room=data['room'])


if __name__ == '__main__':
    socketio.run(app, debug=True)
