# Generated by Django 3.2.16 on 2023-12-21 16:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('deliveries', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pallet',
            name='timestamp',
        ),
        migrations.RemoveField(
            model_name='pallet',
            name='user',
        ),
    ]
