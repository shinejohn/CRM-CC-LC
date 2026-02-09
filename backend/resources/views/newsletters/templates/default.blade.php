<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $newsletter->subject }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
        }
        .header .date {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .article {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .article:last-child {
            border-bottom: none;
        }
        .article h3 {
            color: #007bff;
            margin-top: 0;
        }
        .article img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .article a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }
        .article a:hover {
            text-decoration: underline;
        }
        .sponsor {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
            text-align: center;
        }
        .sponsor h3 {
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $community->name ?? 'Community Newsletter' }}</h1>
            <div class="date">{{ $date }}</div>
        </div>

        @if(isset($content['header_sponsor']))
            <div class="sponsor">
                <h3>Sponsored by {{ $content['header_sponsor']['sponsor_name'] }}</h3>
                @if(isset($content['header_sponsor']['creative']['headline']))
                    <h4>{{ $content['header_sponsor']['creative']['headline'] }}</h4>
                @endif
                @if(isset($content['header_sponsor']['creative']['image']))
                    <img src="{{ $content['header_sponsor']['creative']['image'] }}" alt="Sponsor">
                @endif
                @if(isset($content['header_sponsor']['creative']['cta']))
                    <a href="{{ $content['header_sponsor']['creative']['cta']['url'] ?? '#' }}">
                        {{ $content['header_sponsor']['creative']['cta']['text'] ?? 'Learn More' }}
                    </a>
                @endif
            </div>
        @endif

        @if(isset($content['sections']))
            @foreach($content['sections'] as $sectionName => $items)
                @if(!empty($items) && $sectionName !== 'sponsor_spotlight')
                    <div class="section">
                        <h2>{{ ucfirst(str_replace('_', ' ', $sectionName)) }}</h2>
                        @foreach($items as $item)
                            <div class="article">
                                @if(isset($item['image_url']))
                                    <img src="{{ $item['image_url'] }}" alt="{{ $item['headline'] ?? '' }}">
                                @endif
                                @if(isset($item['headline']))
                                    <h3>{{ $item['headline'] }}</h3>
                                @endif
                                @if(isset($item['summary']))
                                    <p>{{ $item['summary'] }}</p>
                                @endif
                                @if(isset($item['link_url']))
                                    <a href="{{ $item['link_url'] }}">Read more →</a>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @endif
            @endforeach
        @endif

        @if(isset($content['sections']['sponsor_spotlight']))
            <div class="sponsor">
                <h3>Sponsor Spotlight</h3>
                @foreach($content['sections']['sponsor_spotlight'] as $sponsor)
                    <h4>{{ $sponsor['sponsor_name'] }}</h4>
                    @if(isset($sponsor['creative']['headline']))
                        <p>{{ $sponsor['creative']['headline'] }}</p>
                    @endif
                    @if(isset($sponsor['creative']['image']))
                        <img src="{{ $sponsor['creative']['image'] }}" alt="Sponsor">
                    @endif
                    @if(isset($sponsor['creative']['cta']))
                        <a href="{{ $sponsor['creative']['cta']['url'] ?? '#' }}">
                            {{ $sponsor['creative']['cta']['text'] ?? 'Learn More' }}
                        </a>
                    @endif
                @endforeach
            </div>
        @endif

        <div class="footer">
            <p>{!! $tracking_pixel !!}</p>
            <p>
                <a href="{{ $unsubscribe_url }}">Unsubscribe</a> | 
                <a href="{{ $web_view_url }}">View in browser</a>
            </p>
            <p>&copy; {{ date('Y') }} {{ $community->name ?? 'Community' }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>



