# Generated by Django 3.2.16 on 2023-12-21 17:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('deliveries', '0002_auto_20231221_1656'),
    ]

    operations = [
        migrations.AddField(
            model_name='palletitem',
            name='grower',
            field=models.CharField(max_length=60, null=True),
        ),
    ]
