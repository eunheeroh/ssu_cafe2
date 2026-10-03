import { Fragment, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { DRINKS, SIZES, OPTIONS } from '../menu.js';

// 처음 상태 (다시 작성 버튼을 누르면 이 값으로 돌아감)
const INITIAL = {
  name: '',
  phone: '',
  drink: '',
  size: 'M',
  options: [],
  quantity: '1',
  request: '',
};

// 수량을 1~10 사이 정수로 보정하는 함수
function toQuantity(value) {
  const q = parseInt(value, 10);
  if (isNaN(q) || q < 1) return 1;
  if (q > 10) return 10;
  return q;
}

// 예상 금액을 계산하는 함수
function calculateTotal(order) {
  // 음료 기본 가격 (선택 안 했으면 0원)
  const drink = DRINKS.find((d) => d.name === order.drink);
  if (!drink) return 0;

  // 사이즈 추가 금액
  const sizePrice = SIZES.find((s) => s.value === order.size).price;

  // 추가 옵션 금액 합계
  const optionPrice = OPTIONS
    .filter((opt) => order.options.includes(opt.value))
    .reduce((sum, opt) => sum + opt.price, 0);

  // (음료 + 사이즈 + 옵션) × 수량
  return (drink.price + sizePrice + optionPrice) * toQuantity(order.quantity);
}

export default function OrderForm({ user }) {
  const [order, setOrder] = useState(INITIAL);
  const [confirmMessage, setConfirmMessage] = useState('');

  // 입력값이 바뀌면 금액은 렌더링할 때마다 자동으로 다시 계산됨
  const total = calculateTotal(order);

  // 한 항목만 바꾸는 함수
  function update(field, value) {
    setOrder((prev) => ({ ...prev, [field]: value }));
  }

  // 체크박스 켜기/끄기
  function toggleOption(value) {
    setOrder((prev) => ({
      ...prev,
      options: prev.options.includes(value)
        ? prev.options.filter((v) => v !== value)
        : [...prev.options, value],
    }));
  }

  // ===== 주문하기 =====
  async function handleSubmit(e) {
    e.preventDefault(); // 페이지 새로고침 막기

    // 로그인 검사
    if (!user) {
      alert('로그인 후 주문해주세요');
      document.getElementById('email')?.focus();
      return;
    }

    const name = order.name.trim();

    // 이름 검사
    if (name === '') {
      alert('이름을 입력해주세요');
      document.getElementById('name').focus();
      return;
    }

    // 음료 선택 검사
    if (order.drink === '') {
      alert('음료를 선택해주세요');
      document.getElementById('drink').focus();
      return;
    }

    // 수량 입력칸도 보정된 값으로 맞춰 줌
    const quantity = toQuantity(order.quantity);
    update('quantity', String(quantity));

    // Supabase ssu_cafe 테이블에 주문 저장 (user_id는 DB에서 자동 입력)
    const { error } = await supabase.from('ssu_cafe').insert({
      customer_name: name,
      phone: order.phone.trim() || null,
      drink: order.drink,
      size: order.size,
      options: order.options,
      quantity: quantity,
      request: order.request.trim() || null,
      total_price: total,
    });
    if (error) {
      alert('주문 저장 실패: ' + error.message);
      return;
    }

    // 주문 확인 메시지 표시
    const optionText = order.options.length > 0 ? ` (${order.options.join(', ')})` : '';
    setConfirmMessage(
      `${name}님, ${order.drink} ${order.size}사이즈${optionText} ${quantity}잔, ` +
      `총 ${total.toLocaleString()}원 주문이 접수되었습니다!`
    );
  }

  // ===== 다시 작성 =====
  function handleReset() {
    setOrder(INITIAL);      // 모든 입력 초기화 (사이즈는 기본값 M으로 돌아감)
    setConfirmMessage('');  // 확인 메시지 숨김
  }

  return (
    <>
      <form className="order-form" onSubmit={handleSubmit} noValidate>
        {/* 1. 이름 (필수) */}
        <div className="field">
          <label htmlFor="name">이름 <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            placeholder="홍길동"
            value={order.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>

        {/* 2. 전화번호 */}
        <div className="field">
          <label htmlFor="phone">전화번호</label>
          <input
            type="tel"
            id="phone"
            placeholder="010-1234-5678"
            value={order.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>

        {/* 3. 음료 선택 (드롭다운) */}
        <div className="field">
          <label htmlFor="drink">음료 선택 <span className="required">*</span></label>
          <select id="drink" value={order.drink} onChange={(e) => update('drink', e.target.value)}>
            <option value="">-- 음료를 선택하세요 --</option>
            {DRINKS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} {d.price.toLocaleString()}원
              </option>
            ))}
          </select>
        </div>

        {/* 4. 사이즈 (라디오 버튼, 가로 배치) */}
        <fieldset className="field">
          <legend>사이즈</legend>
          <div className="inline-group">
            {SIZES.map((s) => (
              <Fragment key={s.id}>
                <input
                  type="radio"
                  id={s.id}
                  name="size"
                  value={s.value}
                  checked={order.size === s.value}
                  onChange={() => update('size', s.value)}
                />
                <label htmlFor={s.id}>{s.value} (+{s.price.toLocaleString()}원)</label>
              </Fragment>
            ))}
          </div>
        </fieldset>

        {/* 5. 추가 옵션 (체크박스, 가로 배치) */}
        <fieldset className="field">
          <legend>추가 옵션</legend>
          <div className="inline-group">
            {OPTIONS.map((opt) => (
              <Fragment key={opt.id}>
                <input
                  type="checkbox"
                  id={opt.id}
                  value={opt.value}
                  checked={order.options.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                />
                <label htmlFor={opt.id}>{opt.value} (+{opt.price.toLocaleString()}원)</label>
              </Fragment>
            ))}
          </div>
        </fieldset>

        {/* 6. 수량 */}
        <div className="field">
          <label htmlFor="quantity">수량</label>
          <input
            type="number"
            id="quantity"
            min="1"
            max="10"
            value={order.quantity}
            onChange={(e) => update('quantity', e.target.value)}
          />
        </div>

        {/* 7. 요청사항 */}
        <div className="field">
          <label htmlFor="request">요청사항</label>
          <textarea
            id="request"
            rows="3"
            placeholder="얼음 적게, 덜 달게 등"
            value={order.request}
            onChange={(e) => update('request', e.target.value)}
          />
        </div>

        {/* 예상 금액 표시 영역 (주문하기 버튼 바로 위) */}
        <div className="total-price">예상 금액: {total.toLocaleString()}원</div>

        {/* 8. 주문하기 / 9. 다시 작성 버튼 */}
        <div className="buttons">
          <button type="submit" className="btn btn-order">주문하기</button>
          <button type="button" className="btn btn-reset" onClick={handleReset}>다시 작성</button>
        </div>
      </form>

      {/* 주문 확인 메시지 (주문 후에만 보임) */}
      {confirmMessage && <div className="confirm-message">{confirmMessage}</div>}
    </>
  );
}
