# Generated by Django 3.2.16 on 2023-12-22 11:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deliveries', '0004_auto_20231222_1106'),
    ]

    operations = [
        migrations.AddField(
            model_name='pallet',
            name='start_time',
            field=models.DateTimeField(null=True),
        ),
    ]
