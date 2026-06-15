import React from 'react';
import ReactDOM from 'react-dom/client';
import { toJpeg, toPng } from 'html-to-image';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Gauge,
  Link2,
  ListChecks,
  PlaySquare,
  RefreshCw,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { getGoogleClientId, requestYoutubeAccessToken } from './googleOAuth';
import { fetchConnectedYoutubeChannel } from './youtubeApi';
import { clearYoutubeSession, getYoutubeSession, saveYoutubeSession, type YoutubeSession } from './youtubeSession';
import { formatClientDateTime, formatCompactNumber, formatPercent, formatUsd } from './utils';
import './styles.css';

type Channel = {
  code: string;
  name: string;
  owner: string;
  status: 'Đã kết nối' | 'Cần xác thực' | 'Tạm dừng';
  subscribers: number;
  views: number;
  revenue: number;
  rpm: number;
  growth: number;
  lastSync: string;
};

type InternalRow = {
  code: string;
  channel: string;
  highlight: string;
  action: string;
  status: 'Đã xử lý' | 'Theo dõi' | 'Cần xử lý';
  result: string;
};

const channels: Channel[] = [
  {
    code: 'YT131',
    name: 'Minh Tân TV',
    owner: 'Team Wind Media',
    status: 'Đã kết nối',
    subscribers: 90425,
    views: 27720712,
    revenue: 423.28,
    rpm: 0.027,
    growth: 156,
    lastSync: '2026-06-15T03:30:00.000Z',
  },
  {
    code: 'YT138',
    name: 'Út Phương Miền Tây',
    owner: 'Team Wind Media',
    status: 'Đã kết nối',
    subscribers: 52840,
    views: 14890440,
    revenue: 201.72,
    rpm: 0.019,
    growth: 40.9,
    lastSync: '2026-06-15T03:28:00.000Z',
  },
  {
    code: 'YT203',
    name: 'ABC Shorts',
    owner: 'Partner ABC',
    status: 'Cần xác thực',
    subscribers: 18220,
    views: 6021340,
    revenue: 80.1,
    rpm: 0.014,
    growth: -8.4,
    lastSync: '2026-06-14T21:10:00.000Z',
  },
];

const internalRows: InternalRow[] = [
  {
    code: 'YT131',
    channel: 'Minh Tân TV',
    highlight: 'Lượt xem và người đăng ký mới tăng mạnh so với tháng trước; doanh thu tăng ổn định.',
    action: 'Giữ nhịp nội dung hiện tại, ưu tiên series có retention tốt.',
    status: 'Đã xử lý',
    result: 'Views +175%, Subscribers +166%, Revenue +184%',
  },
  {
    code: 'YT138',
    channel: 'Út Phương Miền Tây',
    highlight: 'Subscriber tăng tốt nhưng view giảm nhẹ do lịch đăng chưa ổn định.',
    action: 'Bổ sung short theo chủ đề đang có RPM cao, theo dõi thêm 7 ngày.',
    status: 'Theo dõi',
    result: 'Views -20.1%, RPM +40.9%, Revenue +86.2%',
  },
  {
    code: 'YT203',
    channel: 'ABC Shorts',
    highlight: 'Token YouTube hết hạn, chưa lấy được revenue mới nhất.',
    action: 'Yêu cầu admin kết nối lại OAuth trước cronjob ngày mai.',
    status: 'Cần xử lý',
    result: 'Sync failed: refresh token required',
  },
];

const syncLogs = [
  { channel: 'Minh Tân TV', status: 'Success', time: '2026-06-15T03:30:00.000Z', message: 'Đồng bộ 31 ngày dữ liệu' },
  { channel: 'Út Phương Miền Tây', status: 'Success', time: '2026-06-15T03:28:00.000Z', message: 'Đồng bộ metrics tháng 05/2026' },
  { channel: 'ABC Shorts', status: 'Failed', time: '2026-06-14T21:10:00.000Z', message: 'OAuth token expired' },
];

function App() {
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [exportState, setExportState] = React.useState('Ready to export image');
  const [youtubeSession, setYoutubeSession] = React.useState<YoutubeSession | null>(() => getYoutubeSession());
  const [youtubeStatus, setYoutubeStatus] = React.useState(youtubeSession ? 'YouTube connected' : 'YouTube not connected');
  const [isConnectingYoutube, setIsConnectingYoutube] = React.useState(false);

  async function connectYoutube() {
    const clientId = getGoogleClientId();
    if (!clientId) {
      setYoutubeStatus('Missing VITE_GOOGLE_CLIENT_ID at FE build time');
      return;
    }

    setIsConnectingYoutube(true);
    setYoutubeStatus('Connecting Google...');
    try {
      const token = await requestYoutubeAccessToken(clientId);
      setYoutubeStatus('Loading YouTube channel...');
      const channel = await fetchConnectedYoutubeChannel(token.accessToken);
      const session = { ...token, channel };
      saveYoutubeSession(session);
      setYoutubeSession(session);
      setYoutubeStatus('YouTube connected');
    } catch (error) {
      setYoutubeStatus(error instanceof Error ? error.message : 'YouTube connection failed');
    } finally {
      setIsConnectingYoutube(false);
    }
  }

  function disconnectYoutube() {
    clearYoutubeSession();
    setYoutubeSession(null);
    setYoutubeStatus('YouTube disconnected');
  }

  async function exportReport(format: 'png' | 'jpeg') {
    if (!reportRef.current) return;
    setExportState('Đang tạo ảnh...');
    const dataUrl = format === 'png' ? await toPng(reportRef.current, { pixelRatio: 2 }) : await toJpeg(reportRef.current, { quality: 0.96, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `bao-cao-youtube-05-2026.${format === 'png' ? 'png' : 'jpg'}`;
    link.href = dataUrl;
    link.click();
    setExportState(`Đã xuất ${format.toUpperCase()}`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark"><PlaySquare size={22} /></div>
          <div>
            <strong>YouTube Ops</strong>
            <span>Report Admin</span>
          </div>
        </div>
        <nav className="nav-list">
          <a href="#dashboard"><Gauge size={18} /> Dashboard</a>
          <a href="#channels"><Users size={18} /> Kênh</a>
          <a href="#internal"><ListChecks size={18} /> Báo cáo nội bộ</a>
          <a href="#partner"><FileImage size={18} /> Báo cáo đối tác</a>
          <a href="#sync"><RefreshCw size={18} /> Sync logs</a>
          <a href="#settings"><Settings size={18} /> Settings</a>
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Admin prototype</p>
            <h1>Quản lý báo cáo YouTube</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button"><CalendarDays size={17} /> Tháng 05/2026 <ChevronDown size={16} /></button>
            <button className="primary-button"><RefreshCw size={17} /> Chạy sync</button>
          </div>
        </header>

        <section className="metrics-grid" id="dashboard">
          <MetricCard label="Tổng kênh" value="3" detail="2 đã kết nối" icon={<Users size={20} />} />
          <MetricCard label="Lượt xem tháng" value="48.6M" detail="+35.7% so với tháng trước" icon={<BarChart3 size={20} />} tone="green" />
          <MetricCard label="Doanh thu" value="$705.10" detail="Revenue data từ Analytics API" icon={<Activity size={20} />} />
          <MetricCard label="Sync gần nhất" value="10:30" detail="Hiển thị theo timezone client" icon={<RefreshCw size={20} />} />
        </section>

        <section className="panel" id="channels">
          <PanelHeader title="Danh sách kênh" subtitle="Quản lý mã kênh, OAuth và trạng thái đồng bộ." action="Thêm kênh" />
          <div className="toolbar">
            <label className="search-box"><Search size={17} /><input placeholder="Tìm theo mã kênh hoặc tên kênh" /></label>
            <button className="ghost-button" onClick={connectYoutube} disabled={isConnectingYoutube}><Link2 size={17} /> {isConnectingYoutube ? 'Connecting' : 'Connect YouTube'}</button>
          </div>
          <div className="youtube-session-card">
            {youtubeSession ? (
              <>
                {youtubeSession.channel.thumbnailUrl ? <img src={youtubeSession.channel.thumbnailUrl} alt="" /> : <div className="youtube-session-placeholder"><PlaySquare size={22} /></div>}
                <div>
                  <strong>{youtubeSession.channel.title}</strong>
                  <span>{youtubeStatus} - Token expires: {formatClientDateTime(new Date(youtubeSession.expiresAt).toISOString())}</span>
                </div>
                <button className="ghost-button" onClick={disconnectYoutube}>Disconnect</button>
              </>
            ) : (
              <>
                <div className="youtube-session-placeholder"><PlaySquare size={22} /></div>
                <div>
                  <strong>Google YouTube session</strong>
                  <span>{youtubeStatus}</span>
                </div>
              </>
            )}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Mã</th><th>Tên kênh</th><th>Trạng thái</th><th>Subscribers</th><th>Views</th><th>Revenue</th><th>Sync gần nhất</th></tr>
              </thead>
              <tbody>
                {channels.map((channel) => (
                  <tr key={channel.code}>
                    <td><strong>{channel.code}</strong></td>
                    <td><div className="channel-name"><span>{channel.name}</span><small>{channel.owner}</small></div></td>
                    <td><StatusBadge status={channel.status} /></td>
                    <td>{formatCompactNumber(channel.subscribers)}</td>
                    <td>{formatCompactNumber(channel.views)}</td>
                    <td>{formatUsd(channel.revenue)}</td>
                    <td>{formatClientDateTime(channel.lastSync)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel" id="internal">
          <PanelHeader title="Báo cáo nội bộ" subtitle="Bảng vận hành dạng spreadsheet để team theo dõi vấn đề, xử lý và kết quả." action="Thêm dòng" />
          <div className="internal-grid">
            {internalRows.map((row, index) => (
              <article className="internal-row" key={row.code}>
                <div className="row-index">{index + 1}</div>
                <div><strong>{row.code}</strong><a>{row.channel}</a></div>
                <p>{row.highlight}</p>
                <p>{row.action}</p>
                <StatusBadge status={row.status} />
                <p className="result-text">{row.result}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="report-section" id="partner">
          <div className="panel report-editor">
            <PanelHeader title="Báo cáo tháng đối tác" subtitle="Text nhập trực tiếp: Đánh giá chung và Đề xuất phát triển." action="Lưu nháp" />
            <label>Đánh giá chung<textarea defaultValue={'Kênh đạt được nút bạc YouTube\nSố lượng người đăng ký mới trong tháng 5 tăng tốt so với tháng 4\nLượt xem tăng trưởng ổn định, doanh thu tối ưu hơn'} /></label>
            <label>Đề xuất phát triển<textarea defaultValue={'Tiếp tục giữ tần suất đăng tải hiện tại\nNội dung PT 6 múi đang có tín hiệu tốt, có thể tiếp tục collab\nGắn sản phẩm trong video để tăng cơ hội xuất hiện đề xuất'} /></label>
            <div className="export-actions">
              <button className="primary-button" onClick={() => exportReport('png')}><Download size={17} /> Xuất PNG</button>
              <button className="ghost-button" onClick={() => exportReport('jpeg')}><Download size={17} /> Xuất JPG</button>
            </div>
            <p className="helper-text">{exportState}</p>
          </div>

          <div className="report-preview-shell">
            <PartnerReport ref={reportRef} />
          </div>
        </section>

        <section className="panel" id="sync">
          <PanelHeader title="Sync logs" subtitle="Theo dõi cronjob, lỗi token và lần chạy thủ công." action="Chạy lại lỗi" />
          <div className="log-list">
            {syncLogs.map((log) => (
              <div className="log-item" key={`${log.channel}-${log.time}`}>
                {log.status === 'Success' ? <CheckCircle2 className="success" size={19} /> : <AlertCircle className="danger" size={19} />}
                <div><strong>{log.channel}</strong><span>{log.message}</span></div>
                <time>{formatClientDateTime(log.time)}</time>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone?: 'green' }) {
  return <article className={`metric-card ${tone ?? ''}`}><div>{icon}</div><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function PanelHeader({ title, subtitle, action }: { title: string; subtitle: string; action: string }) {
  return <div className="panel-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="ghost-button">{action}</button></div>;
}

function StatusBadge({ status }: { status: Channel['status'] | InternalRow['status'] }) {
  const className = status.includes('Đã') ? 'ok' : status.includes('Cần') ? 'warn' : 'watch';
  return <span className={`status ${className}`}>{status}</span>;
}

const PartnerReport = React.forwardRef<HTMLDivElement>((_, ref) => (
  <div className="partner-report" ref={ref}>
    <div className="youtube-logo"><PlaySquare size={42} fill="currentColor" /></div>
    <div className="wind-logo">WIND<br />media</div>
    <div className="report-title"><strong>BÁO CÁO THÁNG 05/2026</strong><span>ABC</span></div>
    <div className="net-badge">YOUTUBE NET</div>
    <div className="upload-count">
      <h3>Số lượng đã đăng tải</h3>
      <div><span>VIDEO</span><strong>4</strong></div>
      <div><span>SHORTS</span><strong>23</strong></div>
    </div>
    <table className="summary-table">
      <thead><tr><th>Số liệu tổng quan</th><th>Tháng 04</th><th>Tháng 05</th><th>Tăng trưởng</th></tr></thead>
      <tbody>
        <tr><td>Người đăng ký</td><td>35.323</td><td>90.425</td><td className="up">▲ {formatPercent(156).replace('+', '')}</td></tr>
        <tr><td>Số lượt xem</td><td>20.431.920</td><td>27.720.712</td><td className="up">▲ {formatPercent(35.7).replace('+', '')}</td></tr>
        <tr><td>Doanh thu</td><td>208,51 $</td><td>423,28 $</td><td className="up">▲ {formatPercent(110.3).replace('+', '')}</td></tr>
      </tbody>
    </table>
    <div className="text-block">
      <h3>Đánh giá chung</h3>
      <ul>
        <li>Kênh đã đạt được nút bạc YouTube.</li>
        <li>Số lượng <b>người đăng ký mới</b> tăng tốt so với tháng 4.</li>
        <li><b>Lượt xem</b> tăng trưởng ổn định ở mức <em>35%</em>, doanh thu tối ưu tới <em>110%</em>.</li>
        <li>Chỉ số <b>RPM</b> tăng từ <em>0,019 USD</em> lên <em>0,027 USD</em>.</li>
      </ul>
      <h3>Đề xuất phát triển</h3>
      <ul>
        <li>Tiếp tục giữ tần suất đăng tải như hiện tại.</li>
        <li>Nội dung PT 6 múi đang được khán giả yêu thích, nên tiếp tục collab.</li>
        <li>Gắn sản phẩm trong video để kênh dễ được YouTube đề xuất hơn.</li>
      </ul>
    </div>
  </div>
));

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
