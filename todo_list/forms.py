from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

User = get_user_model()


class UserRegistration(UserCreationForm):
    email = forms.EmailField(label="Email ID", max_length=255)

    class Meta:
        model = User
        fields = ["full_name", "username", "email"]
        icons = {
            'full_name': 'user-tie',
            'username': 'user',
            'email': 'envelope',
            'password1': 'lock',
            'password2': 'key'
        }

    def __init__(self, *args, **kwargs):
        super(UserRegistration, self).__init__(*args, **kwargs)
        icons = getattr(self.Meta, 'icons', {})

        for field_name, field in self.fields.items():
            # set icon attr on field object
            if field_name in icons:
                field.icon = icons[field_name]

        self.fields['full_name'].widget.attrs.update({
            'required': '',
            'type': 'text',
            'name': 'full_name',
            'maxlength': '255',
            'autofocus class': 'form-control',
            'class': 'form-control',
            'id': 'id_full_name',

        })

        self.fields['username'].widget.attrs.update({
            'required': '',
            'type': 'text',
            'name': 'username',
            'maxlength': '150',
            'class': 'form-control',
            'id': 'id_username',
        })

        self.fields['email'].widget.attrs.update({
            'required': '',
            'type': 'email',
            'name': 'email',
            'maxlength': '255',
            'class': 'form-control',
            'id': 'id_email',

        })

        self.fields['password1'].widget.attrs.update({
            'required': '',
            'type': 'password',
            'name': 'password1',
            'class': 'form-control',
            'autocomplete': 'new-password',
            'id': 'id_password1',
        })

        self.fields['password2'].widget.attrs.update({
            'required': '',
            'type': 'password',
            'name': 'password2',
            'class': 'form-control',
            'autocomplete': 'new-password',
            'id': 'id_password2',

        })


class UserLogin(forms.Form):
    username = forms.CharField(label="Username", max_length=255, widget=forms.TextInput(
        attrs={'type': 'text', 'id': 'username', 'placeholder': '', 'autofocus class': 'form-control', 'class': 'form-control'}))
    password = forms.CharField(widget=forms.PasswordInput(
        attrs={'type': 'password', 'id': 'password', 'placeholder': '', 'class': 'form-control'}))
