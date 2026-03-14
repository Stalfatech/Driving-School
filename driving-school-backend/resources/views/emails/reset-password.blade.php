<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>Hello {{ $user->name }},</p>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <p><a href="{{ $link }}">Reset Password</a></p>
    <p>This link will expire in 60 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Thanks,<br>{{ config('app.name') }}</p>
</body>
</html>