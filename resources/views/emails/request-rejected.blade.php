<!DOCTYPE html>
<html>
<head>
    <title>Request Update</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .badge { display: inline-block; padding: 8px 16px; background: #ff4d4f; color: white; border-radius: 20px; font-size: 14px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff4d4f; }
        .reason-box { background: #fff2f0; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #ffccc7; }
        .button { display: inline-block; padding: 12px 30px; background: #ff4d4f; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✗ Request Update</h1>
        </div>
        <div class="content">
            <div class="badge">REJECTED</div>
            
            <h2>Hello {{ $request->user->fname }},</h2>
            
            <p>Your <strong>{{ $typeLabel }}</strong> request has been reviewed by <strong>{{ $approver->fname }} {{ $approver->lname ?? '' }}</strong>.</p>
            
            <div class="info-box">
                <h3>Request Details:</h3>
                <p><strong>Type:</strong> {{ $typeLabel }}</p>
                <p><strong>Date Submitted:</strong> {{ \Carbon\Carbon::parse($request->submitted_at)->format('F d, Y') }}</p>
                @if($request->purpose)
                <p><strong>Purpose:</strong> {{ $request->purpose }}</p>
                @endif
            </div>
            
            @if($rejectionReason)
            <div class="reason-box">
                <h3 style="color: #cf1322; margin-top: 0;">Reason for Rejection:</h3>
                <p style="font-size: 16px;">{{ $rejectionReason }}</p>
            </div>
            @endif
            
            <p>If you have questions, please contact your approver or submit a new request.</p>
            
            <a href="{{ url('/?type=mail-notification&id=' . $request->id . '&group_id=' . $request->group_id) }}" class="button">
                View Request Details
            </a>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>