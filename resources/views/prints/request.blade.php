<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Travel Order and Itinerary</title>
    <style>
        /* DOMPDF friendly – pure black and white, no colors */
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            margin: 10px;

        }

        /* Remove all padding from all elements */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        h1,
        h2,
        h3,
        h4 {
            margin: 0;
            font-weight: normal;
        }

        .title1 {
            font-size: 12px;
            font-weight: normal;
            margin: 0;
        }

        .title2 {
            font-size: 12px;
            font-weight: bold;
            margin: 0;
        }

        .title3 {
            font-size: 12px;
            font-weight: normal;
            margin: 0;
        }

        /* HEADER with logo, three rows AND annex D */
        .header-row {
            width: 100%;
            display: table;
            margin-bottom: 6px;
        }

        .header-left {
            display: table-cell;
            text-align: left;
            vertical-align: middle;
            width: 100%;
            padding-left: 10px;
        }

        .header-right {
            display: table-cell;
            text-align: right;
            vertical-align: middle;
            width: 30%;
            font-weight: bold;
            font-size: 18px;
        }

        /* large SSS text */
        .main-title {
            line-height: 1.3;

        }

        .main-title .title1,
        .main-title .title2,
        .main-title .title3 {
            text-align: left;
        }

        .ref {
            text-align: right;
            margin: 10px 0 20px 0;
        }

        /* Details table - plain black and white */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0px 0;
            border: 1px solid #000;
        }

        .details-table td {
            border: 1px solid #000;
            padding: 8px 10px;
            vertical-align: top;
        }

        .details-table td.label {
            width: 100px;
            font-weight: bold;
            text-align: left !important;
        }

        .details-table td.value {
            text-align: left;
        }

        /* Main itinerary table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            table-layout: fixed;
        }

        table,
        th,
        td {
            border: 1px solid #000;
        }

        th,
        td {
            padding: 2px 2px;
            text-align: center;
            vertical-align: top;
            word-wrap: break-word;
        }

        th {
            font-weight: bold;
            background-color: #fff;
            /* pure white, no grey */
        }

        .signatures {
            margin-top: 45px;
            width: 100%;
            /* clearfix */
        }

        .signature-block {
            width: 45%;
            float: left;
            margin-right: 5%;
        }

        .signature-block.right {
            float: right;
            margin-right: 0;
        }

        .signature-line {
            margin-top: 50px;
            border-top: 1px solid #000;
            text-align: center;
            padding-top: 8px;
        }

        .total-expenses {
            margin-top: 15px;
            font-weight: bold;
            font-size: 15px;
            text-align: right;
            border-top: 1px solid #000;
            padding-top: 10px;
        }

        .certify-text {
            margin: 30px 0 5px 0;
            text-align: justify;
            border: 1px solid #000;
            padding: 15px;
        }

        /* Force plain black and white for empty cells */
        td:empty:before {
            content: "—";
        }

        /* Remove any background colors from text elements */
        * {
            color: #000 !important;
        }

        /* Ensure borders are pure black */
        table,
        th,
        td,
        .details-table,
        .certify-text,
        .signature-line {
            border-color: #000 !important;
        }

        .small-note {
            font-size: 12px;
        }

        /* Remove any grey backgrounds */
        th,
        .details-table td.label {
            background-color: #fff !important;
        }
    </style>
</head>

<body>

    <!-- HEADER with three rows left + ANNEX D right -->
    <div class="header-row">
        <div style="width: 90px;">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAS8AAADwCAMAAABmHxKkAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAu5QTFRFAAAAAGCTAGCTAGCTAGCTAGCTAGCTAF+TAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAF+SAGCTAmCTAGCTAF+TAGCTAF+TAGCTAGCTAGCTAGCTAF+SAGCTAF+SAF+SAGCTAGCTAGCTAGCTAGCTAV+SAGCTAF+SAGCTAGCTAF+SAF6SAmGUEWqaEmuaD2mZDmiYDGeYCmaXCWWWB2SWCGSWBmOVBWKVBGKUAF6SAF6RAF2Ra6LAzN/pzuDqyt7oyN3nxdrmwdjkvtbjutThudPht9LgtdDfss/er8zcqcnap8jaosXXn8PWncLVmL/Tl77SlLzSkLrQkLnPjrjPibXNhrPLg7HKfq/IfK3Hd6rFdqnFdKjEcKXCbKPAaaG/Y569Yp28YZy8Xpq6XJm6Wpi5VpW3U5O1UJG0UZK17PP2/////v7+/f3+/P39+/z9NoKq3erwInWhxtvmrMvcjbjOb6TB9vn7IXSgq8rbbaTB6/L22+jv+vv89fj69Pj66fH1PYasPoatPYashbPLocTXKXmkOIOrPIWsQIiuQYiuQomvR4yxTI+zTY+zVJS2WJa4W5m5YJu7ZZ6+vNXiG3Ce8fb58Pb58/f69/r7+Pr8+Pv8+vz90+TsLHulJ3ijz+Hq5O7zRIqv8PX4i7fOeqvGBGGU6PD1FW2bK3qkJXeiF26c3urxOoSr7fP3L32m2Ofu8vf5TpG0GW+dpcfYNICpwtjlH3Ogm8DUHnKfMn+o4ezySo6y7vT3AF+TNICoh7TMgrHKr83dP4atSI2xVZS2Z6C+cqfDdKjDgbDJ0OHrw9rl8vb56PH1psfZWZe44u3y7vT4MH6n2ufvu9TiFGybI3Wh5u/0JHais8/ewNfkHXGfJ3ej1uXtmb/T0eLrkrvR4Ovy9/n76vH2L3ymLXymOoOrpMbYrszcRYuw/v7/+vz8o8XY5e70VZW3tdDfeKvFDGeYIXShGW+d/v7+////4u3zJXei3gYf/AAAAPp0Uk5TAAUoXZbC4/b9/5UYqt/4G3PP+wnM/yKePcpP3ExOOwhYbhX5VaSM/7nX7ev/+f///////////////////////////////////////////////////////////////////////////////////////////////////////////////v////v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3/+vr68d6/j7S/KbMAABdTSURBVHic7V0JdBRVur6VBRLTJ2kSSchmYgpUZIl0aYwjD0FAUBZZ5Dl6PCAIiIKg6CiHRfNUfOoICoLmDQwKzzMzGgdkV5FlHN+wKIoJiAoRspAQGCFAAgmBrld7d6c7qft1V3VXpL8DXber63bd/lL1//f+9/vrMiQMBEyoG9DGEOYLQ5gvDGG+MIT5whDmC0OYLwxhvjCE+cLQIl+MimC2xgLgBUQ3Ci++P26BjriGWIZpMq9VFkc0z1+Iqff1iU++EoTL6oK5LbI8YoVL7Iz3bh98JdV2YOrMb5DlwdtO239tvtObr2SmNiIo7bE+nHb+RLNdXnx1YmqD1Jq2ADt/3HNHc77Szl0KWmPaAhKZSo/3zfjKrIkMYmPaAi4nexDmyVen+vDV1RyJkeVu7zz4So4M2y5v2C+7GX13vpKizga9MW0AtoiYMu2NO1/Z1eGOhC84U49qZTe+4mJ9jgDCIPazGjNufNkbrrSxNS341CNq0UVRzumGkDSmLSAu/hel5OIrO7IqNI1pA0hjDisljS+mc2ULB4dBSMZhJR6m8ZUcfSpUjWkDSGxS+mAaX9mnrtzwoD6cmcoNqfF1HVPe0sFhEFuHn+WCxtcNZS0dG4aArB/lrcZXeth8tYbsg/JW4+vGIy0dGoaAnAPyVuMrPmzuW4OzUd5qfCVaZ0KINeuLS/2v2rlE3mp8sZbp3bMR8iQxL0dLlBljpaHyBLLnR8pk1iGluseXJXhU9r9RtZbli63p6kER42PjYx/v+7iWDm/lm3zW4t8lbm0i1uGLteeGUIPgfmbPC/vNZgdYhS8uj7kY6jb4wtvyxmp8cfmMNcNK1uTLUTfIOn7aA5bki7Xd0Xg51I3wDSvyxdY8YlmliwX5Cq1r1IEF+bKqa5RgPb64Pk3WdI0SLMeXo26olafXrcaXhV2jBIvxxdY8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" alt="SSS Logo" style="height:60px; width:auto;">

        </div>
        <div class="header-left main-title">

            <p class="title1" style="text-align: center;">Republic of the Philippines</p>
            <p class="title2" style="text-align: center; font-weight: bold">SOCIAL SECURITY SYSTEM</p>
            <p class="title3" style="text-align: center;">Cagayan de Oro City, Misamis Oriental</p>

        </div>
        <div class="header-right" style="width: 90px;">
            ANNEX D
        </div>
    </div>

    <div class="ref">
        <p><strong>No.:</strong> 2025-MFO-0306</p>
        <p><strong>Date:</strong> November 05, 2025</p>
    </div>


    <h3 style="text-align:center; margin:25px 0;">TRAVEL ORDER AND ITINERARY OF TRAVEL</h3>


    <table class="details-table">
        <tr>
            <td class="label"><strong>Name:</strong></td>
            <td class="value"><?= $request->user->name ?> </td>
        </tr>
        <tr>
            <td class="label"><strong>Position/Level:</strong></td>
            <td class="value"><?= $request->user->position->position ?></td>
        </tr>
        <tr>
            <td class="label"><strong>Office Address:</strong></td>
            <td class="value"><?= $request->user->department->department ?>, <?= $request->user->department->department_address ?></td>
        </tr>
        <tr>
            <td class="label"><strong>Purpose of Travel:</strong></td>
            <td class="value"><?= $request->purpose ?></td>
        </tr>
        <tr>
            <td class="label"><strong>Home Address:</strong></td>
            <td class="value"><?= $request->user->address ?> </td>
        </tr>
    </table>

    <h3 style="margin:20px 0 5px; text-align: center">ITINERARY OF TRAVEL</h3>


    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th width="200px">Place to be Visited</th>
                <th>Departure Time</th>
                <th>Arrival Time</th>
                <th>Mode of Transportation</th>
                <th>Transportation Cost (₱)</th>
                <th>Daily Allowance (₱)</th>
            </tr>
        </thead>
        <tbody>
            <?php
            foreach ($request->travelDays as $k) {
            ?>
                <tr>
                    <td><?= (new DateTime($k->date_from))->format('d-M-Y') ?></td>
                    <td>SSS Cagayan de Oro to Surigao City</td>
                    <td>08:00 AM</td>
                    <td>03:00 PM</td>
                    <td>Customary</td>
                    <td>1,500.00</td>
                    <td>1,500.00</td>
                </tr>
            <?php } ?>
        </tbody>
    </table>

    <!-- Total expenses with plain styling -->
    <div class="total-expenses">
        <strong>Total Estimated Expenses:</strong> ₱2,750.00
    </div>

    <!-- CERTIFICATION STATEMENT with border -->
    <div class="certify-text">
        <strong>CERTIFY THAT</strong> (1) I have reviewed the foregoing itinerary;<br>
        (2) the travel is necessary to the service;<br>
        (3) the travel period is reasonable; and<br>
        (4) the expenses claimed are proper.
    </div>

    <!-- SIGNATURE BLOCKS - COMPLETELY UNCHANGED as requested -->
    <div class="signatures">
        <div class="signature-block">
            <div class="signature-line">
                ATTY. KATHLENE G. GONZALES-JAPUZ<br>
                Department Manager III<br>
                Mindanao North Legal Department
            </div>
        </div>

        <div class="signature-block right">
            <div class="signature-line">
                ATTY. MARIE ANN B. CI<br>
                Division Head<br>
                Operations Legal Services Division II
            </div>
        </div>
    </div>

    <!-- spacer -->
    <div style="clear:both; height:10px;"></div>


</body>

</html>