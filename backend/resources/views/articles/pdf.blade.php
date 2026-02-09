<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $content->title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        h2 {
            color: #1e40af;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .meta {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
        }
        .content {
            margin-top: 20px;
        }
        .content p {
            margin-bottom: 15px;
        }
        .content ul, .content ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>{{ $content->title }}</h1>
    
    <div class="meta">
        <strong>Type:</strong> {{ ucfirst($content->type) }}
        @if($content->duration_seconds)
            | <strong>Duration:</strong> {{ round($content->duration_seconds / 60) }} minutes
        @endif
        @if($content->service_type)
            | <strong>Service:</strong> {{ ucwords(str_replace('_', ' ', $content->service_type)) }}
        @endif
    </div>

    <div class="content">
        {!! nl2br(e($content->article_body)) !!}
    </div>

    @if($content->slides && count($content->slides) > 0)
        <h2>Presentation Slides</h2>
        <ol>
            @foreach($content->slides as $slide)
                <li>
                    <strong>{{ $slide['headline'] ?? 'Slide ' . $slide['id'] }}</strong>
                    @if(isset($slide['content']))
                        <p>{{ $slide['content'] }}</p>
                    @endif
                </li>
            @endforeach
        </ol>
    @endif

    <div class="footer">
        <p>Generated from Learning Center Content</p>
        <p>Slug: {{ $content->slug }}</p>
    </div>
</body>
</html>



