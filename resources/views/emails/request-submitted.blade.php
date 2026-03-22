<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Request Submitted</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f7;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .badge {
            display: inline-block;
            padding: 8px 16px;
            background: #e8f0fe;
            color: #667eea;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .info-section {
            background: #f8fafc;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e2e8f0;
        }
        .info-row {
            display: flex;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
        }
        .info-label {
            width: 140px;
            font-weight: 600;
            color: #4a5568;
        }
        .info-value {
            flex: 1;
            color: #2d3748;
        }
        .travel-days {
            margin-top: 20px;
        }
        .travel-day-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .travel-day-card h4 {
            margin: 0 0 10px;
            color: #4a5568;
            font-size: 16px;
        }
        .button-container {
            text-align: center;
            margin: 35px 0 20px;
        }
        .btn-primary {
            display: inline-block;
            padding: 14px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(102, 126, 234, 0.3);
        }
        .details-link {
            text-align: center;
            margin: 20px 0;
        }
        .details-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        .details-link a:hover {
            text-decoration: underline;
        }
        .footer {
            padding: 25px 30px;
            background: #f8fafc;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #718096;
        }
        .footer p {
            margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
            .info-row {
                flex-direction: column;
            }
            .info-label {
                width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>New Request for Your Review</h1>
            <p>{{ $typeLabel }} Request</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="badge">
                ⏳ Pending Your Approval
            </div>

            <h2 style="margin-top: 0; color: #2d3748;">Hello {{ $recipient->fname }},</h2>
            
            <p style="font-size: 16px; color: #4a5568;">
                <strong>{{ $submitter->fname }} {{ $submitter->lname ?? '' }}</strong> has submitted a new 
                <strong>{{ $typeLabel }}</strong> request that requires your review.
            </p>

            <!-- Request Details -->
            <div class="info-section">
                <h3 style="margin-top: 0; color: #2d3748;">Request Details</h3>
                
                <div class="info-row">
                    <div class="info-label">Request Type:</div>
                    <div class="info-value">{{ $typeLabel }}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Submitted By:</div>
                    <div class="info-value">{{ $submitter->fname }} {{ $submitter->lname ?? '' }}</div>
                </div>
                
                <div class="info-row">
                    <div class="info-label">Date of Request:</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($request->date_of_request)->format('F d, Y') }}</div>
                </div>
                
                @if($request->type === 'travel')
                    <div class="info-row">
                        <div class="info-label">Travel Days:</div>
                        <div class="info-value">{{ $request->total_days ?? 'N/A' }}</div>
                    </div>
                @endif
                
                @if($request->purpose)
                <div class="info-row">
                    <div class="info-label">Purpose:</div>
                    <div class="info-value">{{ $request->purpose }}</div>
                </div>
                @endif
                
                @if($request->reason)
                <div class="info-row">
                    <div class="info-label">Reason:</div>
                    <div class="info-value">{{ $request->reason }}</div>
                </div>
                @endif
                
                @if($request->remarks)
                <div class="info-row">
                    <div class="info-label">Remarks:</div>
                    <div class="info-value">{{ $request->remarks }}</div>
                </div>
                @endif

                <!-- Travel Days Details (if travel request) -->
                @if($request->type === 'travel' && $request->travelDays->count() > 0)
                <div class="travel-days">
                    <h4 style="margin-bottom: 15px; color: #2d3748;">Travel Itinerary</h4>
                    @foreach($request->travelDays as $day)
                    <div class="travel-day-card">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <strong>{{ \Carbon\Carbon::parse($day->date_from)->format('M d') }} - {{ \Carbon\Carbon::parse($day->date_to)->format('M d, Y') }}</strong>
                        </div>
                        <div style="color: #4a5568; font-size: 14px;">
                            <div>📍 {{ $day->place_of_travel ?? 'No location specified' }}</div>
                            <div>🚗 {{ $day->transportation ?? 'No transportation specified' }}</div>
                            @if($day->per_diem)
                            <div>💰 Per Diem: {{ number_format($day->per_diem, 2) }}</div>
                            @endif
                            @if($day->notes)
                            <div>📝 {{ $day->notes }}</div>
                            @endif
                        </div>
                    </div>
                    @endforeach
                </div>
                @endif
            </div>

            <!-- Action Button -->
            <div class="button-container">
                <a href="{{ $approvalUrl }}" class="btn-primary">
                    Review Request
                </a>
            </div>

            <!-- Alternative Link -->
            <div class="details-link">
                <p>Or copy this link: <br>
                <a href="{{ $approvalUrl }}">{{ $approvalUrl }}</a></p>
            </div>

            <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 30px;">
                This request was submitted on {{ \Carbon\Carbon::parse($request->submitted_at)->format('F d, Y \a\t h:i A') }}
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} SSS Legal Hub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>