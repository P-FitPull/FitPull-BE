# TODO (MVP 이후 고려사항) 개발하면서 생각날때마다 추가

## ✅ 인증 관련

- [ ] refreshToken 발급은 하고 있으나 아직 사용하지 않음
  - 추후 /auth/refresh API 구현 필요
  - Redis나 DB에 refreshToken 저장 고려
  - 로그인 세션 유지/만료 로직 확장 예정
  - 로그아웃 (토큰 저장은 추후 구현 예정, 현재는 메시지만 반환)

## ✅ 유저 관련

- [x] 회원 탈퇴는 soft delete 방식으로 구현됨
- [ ] 회원 탈퇴 시 accessToken은 여전히 유효하므로 이후 처리 필요할 수 있음

## ✅ 관리자 기능 (예정)

- [x] 카테고리 CRUD (admin만 접근 가능)
- [x] 상품 승인/거절 기능

## ✅ DB 리셋 시

- [x] 카테고리 '기타'를 심어줘야함 시딩하거나 초기값에 기타가 존재하게? 구현 어떻게 할지

PaymentLog 테이블 추가로 인한 알고리즘 및 로직 추가해야함
RENTAL_PAYMENT (대여 결제)
STORAGE_FEE (장기 보관료)
DAMAGE_COMPENSATION (파손/손상 보상금)
OWNER_PAYOUT (소유주 정산금 지급)
REFUND (환불)

반사적으로 박았는데 사실 profileimage라는건 필요없는게 아닐까 user에 어차피 admin하고만 노는데 근데 확장가능성있으니 넣어두고 반환값을 수정하자 안보이게 잘 숨겨서 ㅇㅇ
