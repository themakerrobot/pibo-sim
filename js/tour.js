// ═══════════════════════════════════════════════════════════
// 튜토리얼 — 파이보가 말풍선으로 화면을 한 바퀴 안내한다
// ═══════════════════════════════════════════════════════════
//  · 페이지별 첫 방문에 자동으로 시작한다 (localStorage 로 1회 기억)
//  · 상단 바의 ? 버튼으로 언제든 다시 볼 수 있다
//  · 강조는 스포트라이트(구멍 뚫린 어두운 막) 방식 — 대상 요소는 건드리지 않는다

(function () {
  const T = s => (typeof PIBO_T === 'function' ? PIBO_T(s) : s);
  const bar = document.querySelector('header, #devTop, #cfTop, #gTop');
  if (!bar) return;
  // '/dev' 처럼 확장자 없는 배포 주소와 '/dev.html' 둘 다 인식한다
  const PAGE = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');

  // 단계: [강조할 요소 선택자(없으면 가운데), 말풍선 문구(한국어 키)]
  const TOURS = {
    'index': [
      [null, '안녕! 여기는 체험툴이에요.\n파이보를 움직이고 모션을 만들어요.'],
      ['.left', '왼쪽에서 배경, LCD, 안경,\n물리 시뮬을 바꿔 봐요.'],
      ['#vp', '파이보예요!\n좌클릭 회전 · 우클릭 이동 · 휠 줌.'],
      ['.right', '관절을 하나씩 움직여서\n포즈를 만들어요.'],
      ['.tl-controls', '타임라인이에요. 키프레임을 넣어\n모션을 만들고 재생해요.'],
      ['#tlSaveMotion', '만든 모션을 저장하면\n실물 로봇에서도 쓸 수 있어요.'],
    ],
    'dev': [
      [null, '여기는 개발툴이에요.\n블록으로 파이보를 코딩해요.'],
      ['#blocklyDiv', '블록을 끌어다 붙여서\n프로그램을 만들어요.'],
      ['#btnRun', '실행을 누르면 파이보가\n블록대로 움직여요.'],
      ['#vp', '파이보가 움직이는 모습을\n여기에서 볼 수 있어요.'],
      ['#btnSave', '만든 블록은 저장하고\n다시 불러올 수 있어요.'],
    ],
    'classify': [
      [null, '여기는 분류툴이에요.\nAI에게 사진 구분을 가르쳐요.'],
      ['#steps', '네 단계로 진행해요.\n만들기 → 모으기 → 학습 → 사용!'],
      ['#clsName', '구분하고 싶은 종류를 만들어요.\n예: 사과, 바나나'],
      ['#srcSel', '웹캠이나 파이보 뷰로\n사진을 찍어요.'],
      ['#capBtn', '클래스를 고른 뒤,\n꾹 눌러서 샘플을 모아요.'],
      ['#trainBtn', '샘플을 다 모으면\n학습 시작을 눌러요.'],
      ['#mdlName', '이름을 짓고 저장하면\n개발툴 블록에서도 쓸 수 있어요.'],
    ],
    'game': [
      [null, '여기는 게임툴이에요.\n블록으로 나만의 게임을 만들어요.'],
      ['#gBlockly', '게임 규칙을\n블록으로 만들어요.'],
      ['#gBtnRun', '실행을 누르면\n게임이 시작돼요.'],
      ['#gHud', '점수와 목숨이\n여기에 나와요.'],
      ['#gBtnExample', '막막하면 예제를 열어서\n먼저 놀아 봐요!'],
    ],
  };

  const steps = TOURS[PAGE];
  if (!steps) return;

  const SEEN_KEY = 'pibo-tour-' + PAGE;
  let idx = -1, box = null;

  function el(tag, cls, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function stop(done) {
    if (box) { box.remove(); box = null; }
    window.removeEventListener('resize', place);
    idx = -1;
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
  }

  function place() {
    if (!box || idx < 0) return;
    const [sel] = steps[idx];
    const spot = box.querySelector('.tour-spot');
    const bub = box.querySelector('.tour-bubble');
    const target = sel ? document.querySelector(sel) : null;

    if (target && target.offsetParent !== null) {
      target.scrollIntoView({ block: 'center' });
      const r = target.getBoundingClientRect();
      const pad = 6;
      spot.style.display = '';
      spot.style.left = (r.left - pad) + 'px';
      spot.style.top = (r.top - pad) + 'px';
      spot.style.width = (r.width + pad * 2) + 'px';
      spot.style.height = (r.height + pad * 2) + 'px';

      // 말풍선: 대상 아래, 안 되면 위
      const bw = Math.min(320, window.innerWidth - 24);
      bub.style.width = bw + 'px';
      let left = Math.max(12, Math.min(r.left, window.innerWidth - bw - 12));
      bub.style.left = left + 'px';
      const bh = bub.offsetHeight || 150;
      if (r.bottom + pad + bh + 20 < window.innerHeight) {
        bub.style.top = (r.bottom + pad + 12) + 'px';
        bub.style.bottom = '';
      } else if (r.top - pad - bh - 20 > 0) {
        bub.style.top = (r.top - pad - bh - 12) + 'px';
        bub.style.bottom = '';
      } else {
        bub.style.top = '';
        bub.style.bottom = '16px';
      }
    } else {
      // 대상 없음: 화면 가운데
      spot.style.display = 'none';
      const bw = Math.min(320, window.innerWidth - 24);
      bub.style.width = bw + 'px';
      bub.style.left = Math.round((window.innerWidth - bw) / 2) + 'px';
      bub.style.top = Math.round(window.innerHeight * 0.3) + 'px';
      bub.style.bottom = '';
    }
  }

  function show(i) {
    idx = i;
    if (!box) {
      box = el('div', 'tour');
      el('div', 'tour-spot', box);
      const bub = el('div', 'tour-bubble', box);
      const img = el('img', 'tour-char', bub);
      img.src = 'img/pibo-hello.png';
      img.alt = '';
      el('div', 'tour-text', bub);
      const foot = el('div', 'tour-foot', bub);
      el('div', 'tour-dots', foot);
      const skip = el('button', 'tour-skip', foot);
      skip.type = 'button';
      skip.textContent = T('그만 볼래요');
      skip.addEventListener('click', () => stop(false));
      const next = el('button', 'tour-next', foot);
      next.type = 'button';
      next.addEventListener('click', () => {
        if (idx + 1 >= steps.length) stop(true);
        else show(idx + 1);
      });
      document.body.appendChild(box);
      window.addEventListener('resize', place);
    }
    box.querySelector('.tour-text').textContent = T(steps[i][1]);
    const dots = box.querySelector('.tour-dots');
    dots.innerHTML = '';
    steps.forEach((_, d) => {
      el('span', 'dot' + (d === i ? ' on' : ''), dots);
    });
    box.querySelector('.tour-next').textContent =
      i + 1 >= steps.length ? T('다 봤어요') : T('다음');
    box.querySelector('.tour-skip').style.display = i + 1 >= steps.length ? 'none' : '';
    place();
    // 이미지 로드 등으로 높이가 바뀌면 한 번 더 잡는다
    requestAnimationFrame(place);
  }

  function start() {
    if (idx >= 0) return;
    show(0);
  }

  // 상단 바 ? 버튼 (다시 보기)
  const help = el('button', 'hbtn');
  help.id = 'helpBtn';
  help.type = 'button';
  help.title = T('도움말');
  help.innerHTML = '<i class="fa-solid fa-question"></i>';
  help.addEventListener('click', start);
  bar.appendChild(help);

  // 첫 방문이면 자동 시작
  let seen = false;
  try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}
  if (!seen) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(start, 600));
    } else setTimeout(start, 600);
  }
})();
