# Generated by Django 4.1.3 on 2022-12-14 06:00

from django.db import migrations, models
import todo_list.models


class Migration(migrations.Migration):

    dependencies = [
        ('todo_list', '0006_alter_users_todo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='users',
            name='todo',
            field=models.JSONField(default=todo_list.models.Users.jsonDefaultFormat, null=True),
        ),
    ]
