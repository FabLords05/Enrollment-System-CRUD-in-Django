from rest_framework import serializers
from .models import Assessment, Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    # This exposes the student ID so React can match it instantly
    student_id = serializers.IntegerField(source='enrollment_record.student.id', read_only=True)
    # This nests the payment history inside the assessment view
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = ['id', 'enrollment_record', 'student_id', 'total_units', 'total_amount', 'balance_due', 'payments']