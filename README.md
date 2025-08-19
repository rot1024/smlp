<div align="center">

<img src="public/gpen.svg" alt="漫画工程表ジェネレータ" width="64" height="64">

# 漫画工程表ジェネレータ

</div>

マンガ制作者向けの週次工程表生成ツール。SMLP文字列（ページごとのコマ評価）から自動的に作業スケジュールを生成します。

## 特徴

- 🎨 **SMLP文字列入力**: ページごとのコマをS/M/Lで評価した文字列を入力
- 📊 **自動スケジューリング**: L→M→Sの優先順で効率的な作業計画を自動生成
- 📅 **週次・日次ビュー**: 週単位のサマリと日別の詳細スケジュールを表示
- 📈 **ガントチャート**: 作業量を視覚的に把握できるチャート表示
- 💾 **データ保存**: ローカルストレージへの保存とCSV/JSONエクスポート
- 🔒 **プライバシー重視**: すべてブラウザ内で処理、外部サーバーへの送信なし

## デモ

[https://rot1024.github.io/smlp/](https://rot1024.github.io/smlp/)

## 使い方

### 1. SMLP文字列の入力

コマの作画コストを以下の基準で評価：
- **S (Small)**: 簡単なコマ（30分程度）
- **M (Medium)**: 標準的なコマ（60分程度）  
- **L (Large)**: 複雑なコマ（90分程度）
- **P (Page)**: ページ区切り

例: `MMLMMPSMMSMMPLLSP`

小文字も使用可能で、スペースやカンマなどの記号は自動的に無視されます。

### 2. 設定の調整

- **作業時間**: S/M/Lそれぞれの作業時間（分）を設定
- **締切日**: プロジェクトの締切日を設定
- **開始日**: 任意（未設定の場合は締切から逆算）
- **平日最大作業時間**: 平日（月〜金）の1日あたりの作業時間上限
- **休日最大作業時間**: 休日（土日・祝日）の1日あたりの作業時間上限
- **オフ日**: 作業しない曜日を選択（祝日含む）

### 3. 詳細設定（オプション）

- **祝日を休日として扱う**: 祝日に休日最大作業時間を適用（デフォルトON）
- **ウォームアップ期間**: 序盤の作業効率を調整
- **最終スプリント**: 締切直前の追い込み期間設定
- **パネル分割**: コマを日を跨いで分割可能にするかの設定

### 4. スケジュール生成

「解析してプラン生成」ボタンをクリックすると、自動的にスケジュールが生成されます。

### 5. 手動調整

生成されたスケジュールは以下の方法で調整可能：
- ページ一覧でパネルサイズを個別に変更
- ページの優先順位を調整

### 6. エクスポート

- **ローカル保存**: ブラウザのローカルストレージに保存
- **Notion用コピー**: Notionに貼り付け可能な形式でクリップボードにコピー
- **CSV出力**: 週次・日次のスケジュールをCSV形式で出力
- **JSON出力**: プロジェクト全体をJSON形式で出力
- **印刷/PDF**: ブラウザの印刷機能でPDF化

## 技術スタック

- [React](https://react.dev/) - UIフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Vite](https://vitejs.dev/) - 高速なビルドツール
- [Tailwind CSS v4](https://tailwindcss.com/) - ユーティリティファーストCSS
- [Vitest](https://vitest.dev/) - ユニットテスト

## 開発

### 必要環境

- Node.js 18以上
- npm または yarn

### セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/rot1024/smlp.git
cd smlp

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run preview    # ビルドのプレビュー
npm run lint       # ESLintでコードチェック
npm test           # テスト実行（ウォッチモード）
npm run test:run   # テスト実行（一度のみ）
npm run deploy     # GitHub Pagesへデプロイ
```

### プロジェクト構造

```
src/
├── components/     # Reactコンポーネント
│   ├── InputForm.tsx       # 入力フォーム
│   ├── PageList.tsx        # ページ一覧
│   ├── WeeklySummary.tsx   # 週次サマリ
│   ├── DailySchedule.tsx   # 日別スケジュール
│   ├── GanttChart.tsx      # ガントチャート
│   └── ExportButtons.tsx   # エクスポートボタン
├── lib/           # ビジネスロジック
│   ├── parser.ts           # SMLP文字列パーサー
│   ├── autoAssign.ts       # 自動判定ロジック
│   ├── scheduler.ts        # スケジューラ
│   └── export.ts           # エクスポート機能
├── types/         # TypeScript型定義
└── App.tsx        # メインコンポーネント
```

## テスト

```bash
# すべてのテストを実行
npm run test:run

# ウォッチモードでテスト実行
npm test
```

テストカバレッジ：
- SMLP文字列パーサー: 17テスト
- 自動判定ロジック: 15テスト  
- スケジューラ: 18テスト

## デプロイ

GitHub Pagesへの自動デプロイが設定されています。`main`ブランチへのpushで自動的にデプロイされます。

手動デプロイ：
```bash
npm run deploy
```

## ライセンス

MIT

## 作者

[@rot1024](https://github.com/rot1024)

## Contributing

Issue や Pull Request は歓迎です。

1. Fork する
2. Feature ブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュする (`git push origin feature/amazing-feature`)
5. Pull Request を作成する

## サポート

バグ報告や機能要望は [GitHub Issues](https://github.com/rot1024/smlp/issues) までお願いします。