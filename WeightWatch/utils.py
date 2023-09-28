from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import QuerySet, Model
from django.forms import model_to_dict
from django.utils import timezone

DATE_FORMAT = "%Y-%m-%dT%H:%M"


class ModelJSONEncoder(DjangoJSONEncoder):
    """DjangoJSONEncoder for including the models and QuerySets"""

    def default(self, o):
        if isinstance(o, QuerySet):
            return list(o.values())
        if isinstance(o, Model):
            return model_to_dict(o)
        if isinstance(o, timezone.datetime):
            return o.strftime(DATE_FORMAT)
        return super(ModelJSONEncoder, self).default(o)