<!DOCTYPE html>
<html>
<head>
    <title>Request Approved</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .badge { display: inline-block; padding: 8px 16px; background: #52c41a; color: white; border-radius: 20px; font-size: 14px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #52c41a; }
        .button { display: inline-block; padding: 12px 30px; background: #52c41a; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Request Approved</h1>
        </div>
        <div class="content">
            <div class="badge">APPROVED</div>
            
            <h2>Hello {{ $request->user->fname }},</h2>
            
            <p>Good news! Your <strong>{{ $typeLabel }}</strong> request has been approved by <strong>{{ $approver->fname }} {{ $approver->lname ?? '' }}</strong>.</p>
            
            <div class="info-box">
                <h3>Request Details:</h3>
                <p><strong>Type:</strong> {{ $typeLabel }}</p>
                <p><strong>Date Submitted:</strong> {{ \Carbon\Carbon::parse($request->submitted_at)->format('F d, Y') }}</p>
                @if($request->purpose)
                <p><strong>Purpose:</strong> {{ $request->purpose }}</p>
                @endif
                @if($request->comment)
                <p><strong>Approver Comment:</strong> {{ $request->comment }}</p>
                @endif
            </div>
            
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