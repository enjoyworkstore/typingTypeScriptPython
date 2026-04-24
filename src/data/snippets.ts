import type { Difficulty, Language, Snippet } from "../types";

const SNIPPETS: Snippet[] = [
  {
    id: "ts-easy-1",
    language: "typescript",
    difficulty: "easy",
    title: "Const Basics",
    description: "定数宣言と四則演算のウォームアップ",
    meaning: "12 と 8 を足した結果を、`total` という定数に入れています。",
    notes: [
      "`const` は再代入しない値を置く宣言です。",
      "`=` は右側の結果を左側の名前に入れる記号です。",
    ],
    code: "const total = 12 + 8;",
  },
  {
    id: "ts-easy-2",
    language: "typescript",
    difficulty: "easy",
    title: "String Variable",
    description: "文字列代入をゆっくり確認",
    meaning: "名前の文字列を `userName` という変数に保存しています。",
    notes: [
      "`let` はあとで値を変えられる変数宣言です。",
      "ダブルクォートで囲むと文字列になります。",
    ],
    code: 'let userName = "Aki";',
  },
  {
    id: "ts-easy-3",
    language: "typescript",
    difficulty: "easy",
    title: "Simple Array",
    description: "配列リテラルの基本形",
    meaning: "3つの数字をまとめて `list` という配列にしています。",
    notes: [
      "`[ ]` は複数の値を順番付きで持つ配列です。",
      "カンマで区切ると要素を追加できます。",
    ],
    code: "const list = [1, 2, 3];",
  },
  {
    id: "ts-easy-4",
    language: "typescript",
    difficulty: "easy",
    title: "If Statement",
    description: "条件分岐とブロック記法の練習",
    meaning: "点数が 80 以上なら、`good` を表示する条件分岐です。",
    notes: [
      "`if (...)` の中が真のときだけブロックが実行されます。",
      "`console.log()` は画面の裏側のコンソールへ表示します。",
    ],
    code: 'if (score >= 80) {\n  console.log("good");\n}',
  },
  {
    id: "ts-normal-1",
    language: "typescript",
    difficulty: "normal",
    title: "Typed Function",
    description: "引数型と戻り値型を持つ関数",
    meaning: "名前を受け取り、あいさつ文を文字列で返す関数です。",
    notes: [
      "`name: string` は引数 `name` が文字列型だと示します。",
      "`: string` は戻り値も文字列になることを表します。",
    ],
    code: 'function greet(name: string): string {\n  return `Hello, ${name}`;\n}',
  },
  {
    id: "ts-normal-2",
    language: "typescript",
    difficulty: "normal",
    title: "Object Type",
    description: "type 宣言とセミコロンの練習",
    meaning: "プロフィールの形を `Profile` という型として定義しています。",
    notes: [
      "`type` はデータの形に名前を付けるときに使います。",
      "`name` と `level` はこの型が持つ項目です。",
    ],
    code: "type Profile = {\n  name: string;\n  level: number;\n};",
  },
  {
    id: "ts-normal-3",
    language: "typescript",
    difficulty: "normal",
    title: "Filter Users",
    description: "アロー関数とドット記法の練習",
    meaning: "`users` の中から `active` が真のものだけを取り出しています。",
    notes: [
      "`filter()` は条件に合う要素だけを新しい配列にします。",
      "`user.active` はオブジェクトの `active` プロパティ参照です。",
    ],
    code: "const result = users.filter((user) => user.active);",
  },
  {
    id: "ts-normal-4",
    language: "typescript",
    difficulty: "normal",
    title: "Loop Total",
    description: "for...of と複合代入の練習",
    meaning: "商品一覧を順番に見て、価格を `total` に足し込んでいます。",
    notes: [
      "`for...of` は配列の要素を1つずつ取り出すループです。",
      "`+=` は今ある値に右側を加える書き方です。",
    ],
    code: "for (const item of items) {\n  total += item.price;\n}",
  },
  {
    id: "py-easy-1",
    language: "python",
    difficulty: "easy",
    title: "Simple Sum",
    description: "Python の代入と演算",
    meaning: "12 と 8 を足した値を `total` に入れています。",
    notes: [
      "Python は末尾のセミコロンが通常不要です。",
      "`=` は右側の計算結果を左側に代入します。",
    ],
    code: "total = 12 + 8",
  },
  {
    id: "py-easy-2",
    language: "python",
    difficulty: "easy",
    title: "Name String",
    description: "スネークケースと文字列代入",
    meaning: "文字列 `Aki` を `user_name` という変数に入れています。",
    notes: [
      "Python では `user_name` のようなスネークケースをよく使います。",
      "文字列はクォートで囲んで表します。",
    ],
    code: 'user_name = "Aki"',
  },
  {
    id: "py-easy-3",
    language: "python",
    difficulty: "easy",
    title: "Simple List",
    description: "リストの基本形",
    meaning: "数字を3つまとめて `items` というリストにしています。",
    notes: [
      "Python のリストも `[ ]` で表します。",
      "要素の順番を保ったまま扱えます。",
    ],
    code: "items = [1, 2, 3]",
  },
  {
    id: "py-easy-4",
    language: "python",
    difficulty: "easy",
    title: "If Print",
    description: "コロンとインデントの練習",
    meaning: "点数が 80 以上なら `good` を表示する条件分岐です。",
    notes: [
      "Python は `{}` の代わりにコロンとインデントで範囲を表します。",
      "`print()` は標準出力に文字を表示します。",
    ],
    code: 'if score >= 80:\n  print("good")',
  },
  {
    id: "py-normal-1",
    language: "python",
    difficulty: "normal",
    title: "Typed Function",
    description: "型ヒント付き関数と f 文字列",
    meaning: "名前を受け取り、あいさつ文を返す関数です。",
    notes: [
      "`name: str` は引数が文字列だという型ヒントです。",
      "`f\"...\"` で変数を文の中へ埋め込めます。",
    ],
    code: 'def greet(name: str) -> str:\n  return f"Hello, {name}"',
  },
  {
    id: "py-normal-2",
    language: "python",
    difficulty: "normal",
    title: "Loop Price",
    description: "辞書アクセスと複合代入",
    meaning: "各 `item` の価格を取り出して `total` に足しています。",
    notes: [
      "`for item in items` は要素を順番に見るループです。",
      "`item[\"price\"]` は辞書の `price` キーにある値を取ります。",
    ],
    code: 'for item in items:\n  total += item["price"]',
  },
  {
    id: "py-normal-3",
    language: "python",
    difficulty: "normal",
    title: "Dictionary Literal",
    description: "複数行辞書とカンマの練習",
    meaning: "プロフィール情報を辞書として `profile` にまとめています。",
    notes: [
      "辞書は `キー: 値` の組み合わせを持つデータです。",
      "複数行でもカンマで項目を区切れます。",
    ],
    code: 'profile = {\n  "name": "Aki",\n  "level": 3,\n}',
  },
  {
    id: "py-normal-4",
    language: "python",
    difficulty: "normal",
    title: "List Comprehension",
    description: "内包表記と range の練習",
    meaning: "`range(5)` の値を使って新しいリストを作っています。",
    notes: [
      "リスト内包表記は短く配列を作る書き方です。",
      "`range(5)` は 0 から 4 までの連続値を作ります。",
    ],
    code: "numbers = [value for value in range(5)]",
  },
  {
    id: "sql-easy-1",
    language: "sql",
    difficulty: "easy",
    title: "Simple Select",
    description: "SELECT と FROM の基本",
    meaning: "`users` テーブルから `name` 列だけを取り出しています。",
    notes: [
      "`SELECT` は取り出したい列を指定します。",
      "`FROM` はどのテーブルを見るかを表します。",
    ],
    code: "SELECT name FROM users;",
  },
  {
    id: "sql-easy-2",
    language: "sql",
    difficulty: "easy",
    title: "Insert Row",
    description: "INSERT の基本形",
    meaning: "`logs` テーブルへ 1 行追加しています。",
    notes: [
      "`INSERT INTO` は新しい行を追加するときに使います。",
      "`VALUES` に追加する値を順番に書きます。",
    ],
    code: "INSERT INTO logs (message) VALUES ('done');",
  },
  {
    id: "sql-easy-3",
    language: "sql",
    difficulty: "easy",
    title: "Update Flag",
    description: "UPDATE と WHERE の基本",
    meaning: "`id = 3` のユーザーだけ `active` を 1 に更新しています。",
    notes: [
      "`SET` で更新したい列と値を指定します。",
      "`WHERE` を付けないと全行更新になることがあります。",
    ],
    code: "UPDATE users SET active = 1 WHERE id = 3;",
  },
  {
    id: "sql-easy-4",
    language: "sql",
    difficulty: "easy",
    title: "Delete Rows",
    description: "DELETE の基本形",
    meaning: "期限切れのセッション行を削除しています。",
    notes: [
      "`DELETE FROM` は行を削除する命令です。",
      "`WHERE expired = 1` で対象行を絞っています。",
    ],
    code: "DELETE FROM sessions WHERE expired = 1;",
  },
  {
    id: "sql-normal-1",
    language: "sql",
    difficulty: "normal",
    title: "Order Scores",
    description: "WHERE と ORDER BY の組み合わせ",
    meaning: "80点以上のプレイヤーを高得点順に取り出しています。",
    notes: [
      "`ORDER BY score DESC` は大きい順に並べます。",
      "複数行に分けても 1 つの SQL 文として実行されます。",
    ],
    code: "SELECT name, score\nFROM players\nWHERE score >= 80\nORDER BY score DESC;",
  },
  {
    id: "sql-normal-2",
    language: "sql",
    difficulty: "normal",
    title: "Group Count",
    description: "GROUP BY と集計関数",
    meaning: "部署ごとの人数を集計しています。",
    notes: [
      "`COUNT(*)` は行数を数える関数です。",
      "`GROUP BY department` で部署単位にまとめます。",
    ],
    code: "SELECT department, COUNT(*) AS total\nFROM employees\nGROUP BY department;",
  },
  {
    id: "sql-normal-3",
    language: "sql",
    difficulty: "normal",
    title: "Create Table",
    description: "CREATE TABLE の基本",
    meaning: "`tasks` テーブルの列構成を定義しています。",
    notes: [
      "`PRIMARY KEY` は主キー列を表します。",
      "`NOT NULL` は空を許可しない制約です。",
    ],
    code: "CREATE TABLE tasks (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL\n);",
  },
  {
    id: "sql-normal-4",
    language: "sql",
    difficulty: "normal",
    title: "CTE Select",
    description: "WITH を使った抽出",
    meaning: "最近の注文だけを一度まとめてから必要な列を取り出しています。",
    notes: [
      "`WITH` で一時的な結果セットに名前を付けられます。",
      "長い検索条件を分けて読みやすくできます。",
    ],
    code: "WITH recent_orders AS (\n  SELECT * FROM orders WHERE created_at >= '2026-01-01'\n)\nSELECT id, user_id FROM recent_orders;",
  },
];

const ADDITIONAL_SNIPPETS: Snippet[] = [
  {
    id: "ts-easy-5",
    language: "typescript",
    difficulty: "easy",
    title: "Boolean Flag",
    description: "真偽値の代入",
    meaning: "`isReady` に真偽値 `true` を保存しています。",
    notes: [
      "`boolean` は真か偽を表す値です。",
      "`true` は条件が成立している状態を示します。",
    ],
    code: "const isReady = true;",
  },
  {
    id: "ts-easy-6",
    language: "typescript",
    difficulty: "easy",
    title: "Template Text",
    description: "テンプレート文字列の基本",
    meaning: "`name` の値を文の中へ埋め込んでいます。",
    notes: [
      "バッククォートで囲むとテンプレート文字列になります。",
      "`${...}` の中に変数を書けます。",
    ],
    code: "const text = `Hi, ${name}`;",
  },
  {
    id: "ts-easy-7",
    language: "typescript",
    difficulty: "easy",
    title: "Object Literal",
    description: "小さなオブジェクト",
    meaning: "名前とレベルを持つオブジェクトを作っています。",
    notes: [
      "`{}` は関連する値をまとめるオブジェクトです。",
      "`name: \"Aki\"` はキーと値の組です。",
    ],
    code: 'const user = { name: "Aki", level: 2 };',
  },
  {
    id: "ts-easy-8",
    language: "typescript",
    difficulty: "easy",
    title: "Call Function",
    description: "関数呼び出し",
    meaning: "`greet` 関数に `userName` を渡して呼び出しています。",
    notes: [
      "`()` は関数を実行する記号です。",
      "引数は関数へ渡す入力値です。",
    ],
    code: "greet(userName);",
  },
  {
    id: "ts-normal-5",
    language: "typescript",
    difficulty: "normal",
    title: "Map Names",
    description: "map とプロパティ参照",
    meaning: "ユーザー一覧から名前だけの配列を作っています。",
    notes: [
      "`map()` は各要素を変換した新しい配列を返します。",
      "`user.name` はユーザーの名前プロパティです。",
    ],
    code: "const names = users.map((user) => user.name);",
  },
  {
    id: "ts-normal-6",
    language: "typescript",
    difficulty: "normal",
    title: "Optional Message",
    description: "optional chaining",
    meaning: "`profile` が存在するときだけ `message` を取り出しています。",
    notes: [
      "`?.` は値がない場合にエラーを避ける書き方です。",
      "`??` は左が null や undefined のとき右を使います。",
    ],
    code: 'const message = profile?.message ?? "none";',
  },
  {
    id: "ts-normal-7",
    language: "typescript",
    difficulty: "normal",
    title: "Reduce Total",
    description: "reduce の合計",
    meaning: "数値配列を合計して `total` にしています。",
    notes: [
      "`reduce()` は配列を1つの値にまとめます。",
      "`sum + value` で合計を更新します。",
    ],
    code: "const total = values.reduce((sum, value) => sum + value, 0);",
  },
  {
    id: "ts-normal-8",
    language: "typescript",
    difficulty: "normal",
    title: "Async Fetch",
    description: "async と await",
    meaning: "非同期処理の結果を待って `data` に入れています。",
    notes: [
      "`async` 関数では `await` を使えます。",
      "`await` はPromiseの完了を待つ書き方です。",
    ],
    code: "const data = await fetchUser(userId);",
  },
  {
    id: "py-easy-5",
    language: "python",
    difficulty: "easy",
    title: "Boolean Flag",
    description: "真偽値の代入",
    meaning: "`is_ready` に真偽値 `True` を保存しています。",
    notes: [
      "Python の真は `True` と大文字で書きます。",
      "状態を表す変数名には `is_` がよく使われます。",
    ],
    code: "is_ready = True",
  },
  {
    id: "py-easy-6",
    language: "python",
    difficulty: "easy",
    title: "Append Item",
    description: "リストへの追加",
    meaning: "`items` リストに新しい値を追加しています。",
    notes: [
      "`append()` はリストの末尾に要素を追加します。",
      "ドットの後にメソッド名を書きます。",
    ],
    code: 'items.append("task")',
  },
  {
    id: "py-easy-7",
    language: "python",
    difficulty: "easy",
    title: "Dictionary Access",
    description: "辞書の値を読む",
    meaning: "`profile` 辞書から `name` の値を取り出しています。",
    notes: [
      "`dict[\"key\"]` で辞書の値を取得します。",
      "キー名は文字列として書くことが多いです。",
    ],
    code: 'name = profile["name"]',
  },
  {
    id: "py-easy-8",
    language: "python",
    difficulty: "easy",
    title: "Call Function",
    description: "関数呼び出し",
    meaning: "`greet` 関数に `user_name` を渡しています。",
    notes: [
      "`()` は関数を呼び出す記号です。",
      "引数は関数へ渡す入力値です。",
    ],
    code: "greet(user_name)",
  },
  {
    id: "py-normal-5",
    language: "python",
    difficulty: "normal",
    title: "Filter Active",
    description: "条件付きリスト内包表記",
    meaning: "有効なユーザーだけを取り出したリストを作っています。",
    notes: [
      "内包表記の後ろに `if` を付けると条件を絞れます。",
      "`user[\"active\"]` は辞書の状態値です。",
    ],
    code: 'active_users = [user for user in users if user["active"]]',
  },
  {
    id: "py-normal-6",
    language: "python",
    difficulty: "normal",
    title: "Safe Get",
    description: "辞書の get",
    meaning: "`profile` から `message` を取り出し、なければ `none` にします。",
    notes: [
      "`get()` はキーがなくてもエラーにしない取得方法です。",
      "第2引数は見つからないときの既定値です。",
    ],
    code: 'message = profile.get("message", "none")',
  },
  {
    id: "py-normal-7",
    language: "python",
    difficulty: "normal",
    title: "Sum Values",
    description: "sum と内包表記",
    meaning: "商品の価格だけを取り出して合計しています。",
    notes: [
      "`sum()` は数値の集まりを合計します。",
      "内包表記で必要な値だけを渡せます。",
    ],
    code: 'total = sum(item["price"] for item in items)',
  },
  {
    id: "py-normal-8",
    language: "python",
    difficulty: "normal",
    title: "Try Except",
    description: "例外処理",
    meaning: "変換に失敗した場合に `0` を入れる処理です。",
    notes: [
      "`try` は失敗する可能性のある処理を囲みます。",
      "`except` はエラーが起きたときの処理です。",
    ],
    code: "try:\n  count = int(value)\nexcept ValueError:\n  count = 0",
  },
  {
    id: "sql-easy-5",
    language: "sql",
    difficulty: "easy",
    title: "All Columns",
    description: "ワイルドカードの基本",
    meaning: "`products` テーブルの全列を取り出しています。",
    notes: [
      "`*` は全列を意味します。",
      "`WHERE` で価格が 500 未満の行だけに絞っています。",
    ],
    code: "SELECT * FROM products WHERE price < 500;",
  },
  {
    id: "sql-easy-6",
    language: "sql",
    difficulty: "easy",
    title: "Limit Rows",
    description: "LIMIT で件数を絞る",
    meaning: "新しい記事を 5 件だけ取得しています。",
    notes: [
      "`ORDER BY created_at DESC` は新しい順です。",
      "`LIMIT 5` で返す行数を制限します。",
    ],
    code: "SELECT title FROM posts ORDER BY created_at DESC LIMIT 5;",
  },
  {
    id: "sql-easy-7",
    language: "sql",
    difficulty: "easy",
    title: "Alias Column",
    description: "AS を使った別名",
    meaning: "`name` 列を `user_name` という表示名で返しています。",
    notes: [
      "`AS` は列やテーブルに別名を付ける書き方です。",
      "結果表の見出しを分かりやすくできます。",
    ],
    code: "SELECT name AS user_name FROM users;",
  },
  {
    id: "sql-easy-8",
    language: "sql",
    difficulty: "easy",
    title: "Count Rows",
    description: "COUNT の基本",
    meaning: "`orders` テーブルの行数を数えています。",
    notes: [
      "`COUNT(*)` は対象行の件数を返します。",
      "`AS total` で結果列に名前を付けています。",
    ],
    code: "SELECT COUNT(*) AS total FROM orders;",
  },
  {
    id: "sql-normal-5",
    language: "sql",
    difficulty: "normal",
    title: "Join Tables",
    description: "JOIN の基本",
    meaning: "注文とユーザーを結合して名前と金額を取得しています。",
    notes: [
      "`JOIN` は複数テーブルの行をつなげます。",
      "`ON` でどの列同士を対応させるかを書きます。",
    ],
    code: "SELECT users.name, orders.total\nFROM orders\nJOIN users ON users.id = orders.user_id;",
  },
  {
    id: "sql-normal-6",
    language: "sql",
    difficulty: "normal",
    title: "Case Status",
    description: "CASE 式の練習",
    meaning: "点数に応じてランク文字列を切り替えています。",
    notes: [
      "`CASE` は SQL の条件分岐です。",
      "`END AS rank_label` で結果列名を付けています。",
    ],
    code: "SELECT name,\n  CASE WHEN score >= 80 THEN 'A' ELSE 'B' END AS rank_label\nFROM players;",
  },
  {
    id: "sql-normal-7",
    language: "sql",
    difficulty: "normal",
    title: "Having Count",
    description: "HAVING で集計後に絞る",
    meaning: "2件以上あるカテゴリだけを表示しています。",
    notes: [
      "`HAVING` は集計後の条件に使います。",
      "`GROUP BY` のあとに書くのが基本です。",
    ],
    code: "SELECT category, COUNT(*) AS total\nFROM items\nGROUP BY category\nHAVING COUNT(*) >= 2;",
  },
  {
    id: "sql-normal-8",
    language: "sql",
    difficulty: "normal",
    title: "Sub Query",
    description: "副問い合わせの基本",
    meaning: "平均価格より高い商品だけを取り出しています。",
    notes: [
      "`(SELECT AVG(price) FROM products)` が副問い合わせです。",
      "外側の WHERE 条件の中で結果を使えます。",
    ],
    code: "SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);",
  },
];

type SnippetFactory = () => Omit<Snippet, "id" | "source">;

const GENERATED_TEMPLATES: Record<Language, Record<Difficulty, SnippetFactory[]>> = {
  typescript: {
    easy: [
      () => {
        const variable = pick(["total", "count", "score", "price"]);
        const left = randomInt(3, 48);
        const right = randomInt(2, 36);
        return {
          language: "typescript",
          difficulty: "easy",
          title: "Generated Sum",
          description: "数値計算の生成問題",
          meaning: `${left} と ${right} を足した結果を \`${variable}\` に入れています。`,
          notes: [
            "数値や変数名がセッションごとに変わります。",
            "`const` は値を再代入しないときに使います。",
          ],
          code: `const ${variable} = ${left} + ${right};`,
        };
      },
      () => {
        const variable = pick(["label", "message", "status", "title"]);
        const text = pick(["ready", "typing", "done", "active"]);
        return {
          language: "typescript",
          difficulty: "easy",
          title: "Generated Text",
          description: "文字列代入の生成問題",
          meaning: `文字列 \`${text}\` を \`${variable}\` に保存しています。`,
          notes: [
            "文字列の内容と変数名がランダムに変わります。",
            "TypeScriptでは文末にセミコロンを書くことがあります。",
          ],
          code: `let ${variable} = "${text}";`,
        };
      },
      () => {
        const variable = pick(["values", "scores", "prices", "levels"]);
        const values = [randomInt(1, 9), randomInt(10, 30), randomInt(31, 60)];
        return {
          language: "typescript",
          difficulty: "easy",
          title: "Generated Array",
          description: "配列の生成問題",
          meaning: `3つの数値を \`${variable}\` 配列にまとめています。`,
          notes: [
            "配列の中身が毎回変わります。",
            "`[]` とカンマ入力の練習になります。",
          ],
          code: `const ${variable} = [${values.join(", ")}];`,
        };
      },
      () => {
        const variable = pick(["level", "score", "count"]);
        const limit = randomInt(3, 9) * 10;
        const word = pick(["pass", "ok", "done", "good"]);
        return {
          language: "typescript",
          difficulty: "easy",
          title: "Generated If",
          description: "条件分岐の生成問題",
          meaning: `\`${variable}\` が ${limit} 以上なら \`${word}\` を表示します。`,
          notes: [
            "条件の数値と表示文字列が変わります。",
            "`>=` と波括弧の入力練習になります。",
          ],
          code: `if (${variable} >= ${limit}) {\n  console.log("${word}");\n}`,
        };
      },
    ],
    normal: [
      () => {
        const functionName = pick(["formatName", "makeLabel", "createTitle"]);
        const arg = pick(["name", "label", "title"]);
        return {
          language: "typescript",
          difficulty: "normal",
          title: "Generated Function",
          description: "型付き関数の生成問題",
          meaning: `文字列を受け取り、加工した文字列を返す \`${functionName}\` 関数です。`,
          notes: [
            "関数名と引数名がランダムに変わります。",
            "型注釈とテンプレート文字列を同時に練習できます。",
          ],
          code: `function ${functionName}(${arg}: string): string {\n  return \`#${"${"}${arg}${"}"}\`;\n}`,
        };
      },
      () => {
        const typeName = pick(["Task", "Product", "Member", "Article"]);
        const textField = pick(["name", "title", "label"]);
        const numberField = pick(["count", "price", "level"]);
        return {
          language: "typescript",
          difficulty: "normal",
          title: "Generated Type",
          description: "type 宣言の生成問題",
          meaning: `\`${typeName}\` というデータの形を定義しています。`,
          notes: [
            "型名とプロパティ名が変わります。",
            "コロンとセミコロンの入力練習になります。",
          ],
          code: `type ${typeName} = {\n  ${textField}: string;\n  ${numberField}: number;\n};`,
        };
      },
      () => {
        const collection = pick(["users", "tasks", "items"]);
        const item = collection === "users" ? "user" : collection === "tasks" ? "task" : "item";
        const property = pick(["active", "visible", "ready"]);
        return {
          language: "typescript",
          difficulty: "normal",
          title: "Generated Filter",
          description: "filter の生成問題",
          meaning: `\`${collection}\` から \`${property}\` が真の要素だけを取り出しています。`,
          notes: [
            "配列名とプロパティ名がランダムに変わります。",
            "アロー関数とドット記法の練習になります。",
          ],
          code: `const result = ${collection}.filter((${item}) => ${item}.${property});`,
        };
      },
      () => {
        const collection = pick(["items", "products", "orders"]);
        const item = collection === "orders" ? "order" : "item";
        const property = pick(["price", "amount", "count"]);
        return {
          language: "typescript",
          difficulty: "normal",
          title: "Generated Loop",
          description: "for...of の生成問題",
          meaning: `一覧を順番に見て \`${property}\` を合計しています。`,
          notes: [
            "一覧名とプロパティ名が変わります。",
            "`+=` とブロック構文の入力練習になります。",
          ],
          code: `for (const ${item} of ${collection}) {\n  total += ${item}.${property};\n}`,
        };
      },
    ],
  },
  python: {
    easy: [
      () => {
        const variable = pick(["total", "count", "score", "price"]);
        const left = randomInt(3, 48);
        const right = randomInt(2, 36);
        return {
          language: "python",
          difficulty: "easy",
          title: "Generated Sum",
          description: "数値計算の生成問題",
          meaning: `${left} と ${right} を足した結果を \`${variable}\` に入れています。`,
          notes: [
            "数値や変数名がセッションごとに変わります。",
            "Pythonは文末のセミコロンを通常書きません。",
          ],
          code: `${variable} = ${left} + ${right}`,
        };
      },
      () => {
        const variable = pick(["user_name", "message", "status", "title"]);
        const text = pick(["ready", "typing", "done", "active"]);
        return {
          language: "python",
          difficulty: "easy",
          title: "Generated Text",
          description: "文字列代入の生成問題",
          meaning: `文字列 \`${text}\` を \`${variable}\` に保存しています。`,
          notes: [
            "文字列の内容と変数名がランダムに変わります。",
            "スネークケースの入力練習になります。",
          ],
          code: `${variable} = "${text}"`,
        };
      },
      () => {
        const variable = pick(["values", "scores", "prices", "levels"]);
        const values = [randomInt(1, 9), randomInt(10, 30), randomInt(31, 60)];
        return {
          language: "python",
          difficulty: "easy",
          title: "Generated List",
          description: "リストの生成問題",
          meaning: `3つの数値を \`${variable}\` リストにまとめています。`,
          notes: [
            "リストの中身が毎回変わります。",
            "`[]` とカンマ入力の練習になります。",
          ],
          code: `${variable} = [${values.join(", ")}]`,
        };
      },
      () => {
        const variable = pick(["level", "score", "count"]);
        const limit = randomInt(3, 9) * 10;
        const word = pick(["pass", "ok", "done", "good"]);
        return {
          language: "python",
          difficulty: "easy",
          title: "Generated If",
          description: "条件分岐の生成問題",
          meaning: `\`${variable}\` が ${limit} 以上なら \`${word}\` を表示します。`,
          notes: [
            "条件の数値と表示文字列が変わります。",
            "コロンとインデントの練習になります。",
          ],
          code: `if ${variable} >= ${limit}:\n  print("${word}")`,
        };
      },
    ],
    normal: [
      () => {
        const functionName = pick(["format_name", "make_label", "create_title"]);
        const arg = pick(["name", "label", "title"]);
        return {
          language: "python",
          difficulty: "normal",
          title: "Generated Function",
          description: "型ヒント付き関数の生成問題",
          meaning: `文字列を受け取り、加工した文字列を返す \`${functionName}\` 関数です。`,
          notes: [
            "関数名と引数名がランダムに変わります。",
            "型ヒントと f 文字列を同時に練習できます。",
          ],
          code: `def ${functionName}(${arg}: str) -> str:\n  return f"#{${arg}}"`,
        };
      },
      () => {
        const variable = pick(["profile", "task", "product", "member"]);
        const textField = pick(["name", "title", "label"]);
        const numberField = pick(["count", "price", "level"]);
        return {
          language: "python",
          difficulty: "normal",
          title: "Generated Dict",
          description: "辞書の生成問題",
          meaning: `\`${variable}\` に文字列と数値を持つ辞書を入れています。`,
          notes: [
            "変数名とキー名がランダムに変わります。",
            "クォート、コロン、カンマの練習になります。",
          ],
          code: `${variable} = {\n  "${textField}": "Aki",\n  "${numberField}": ${randomInt(1, 9)},\n}`,
        };
      },
      () => {
        const collection = pick(["users", "tasks", "items"]);
        const item = collection === "users" ? "user" : collection === "tasks" ? "task" : "item";
        const property = pick(["active", "visible", "ready"]);
        return {
          language: "python",
          difficulty: "normal",
          title: "Generated Filter",
          description: "条件付き内包表記の生成問題",
          meaning: `\`${collection}\` から \`${property}\` が真の要素だけを取り出しています。`,
          notes: [
            "配列名とキー名がランダムに変わります。",
            "内包表記の末尾に条件を書く練習になります。",
          ],
          code: `result = [${item} for ${item} in ${collection} if ${item}["${property}"]]`,
        };
      },
      () => {
        const collection = pick(["items", "products", "orders"]);
        const item = collection === "orders" ? "order" : "item";
        const property = pick(["price", "amount", "count"]);
        return {
          language: "python",
          difficulty: "normal",
          title: "Generated Loop",
          description: "for ループの生成問題",
          meaning: `一覧を順番に見て \`${property}\` を合計しています。`,
          notes: [
            "一覧名とキー名が変わります。",
            "`+=` と辞書アクセスの入力練習になります。",
          ],
          code: `for ${item} in ${collection}:\n  total += ${item}["${property}"]`,
        };
      },
    ],
  },
  sql: {
    easy: [
      () => {
        const column = pick(["name", "title", "score", "price"]);
        const table = pick(["users", "tasks", "products", "players"]);
        return {
          language: "sql",
          difficulty: "easy",
          title: "Generated Select",
          description: "SELECT の生成問題",
          meaning: `\`${table}\` テーブルから \`${column}\` 列を取り出しています。`,
          notes: [
            "列名とテーブル名がセッションごとに変わります。",
            "`SELECT ... FROM ...;` の基本形を練習できます。",
          ],
          code: `SELECT ${column} FROM ${table};`,
        };
      },
      () => {
        const table = pick(["logs", "notes", "tasks", "messages"]);
        const column = pick(["message", "title", "status", "label"]);
        const text = pick(["ready", "typing", "done", "active"]);
        return {
          language: "sql",
          difficulty: "easy",
          title: "Generated Insert",
          description: "INSERT の生成問題",
          meaning: `\`${table}\` テーブルへ文字列データを1件追加しています。`,
          notes: [
            "テーブル名と値の内容がランダムに変わります。",
            "`VALUES (...)` の入力練習になります。",
          ],
          code: `INSERT INTO ${table} (${column}) VALUES ('${text}');`,
        };
      },
      () => {
        const table = pick(["users", "tasks", "orders"]);
        const column = pick(["active", "visible", "closed"]);
        const id = randomInt(1, 9);
        return {
          language: "sql",
          difficulty: "easy",
          title: "Generated Update",
          description: "UPDATE の生成問題",
          meaning: `\`${table}\` の指定行を更新しています。`,
          notes: [
            "更新列と行番号がセッションごとに変わります。",
            "`SET` と `WHERE` の練習になります。",
          ],
          code: `UPDATE ${table} SET ${column} = 1 WHERE id = ${id};`,
        };
      },
      () => {
        const table = pick(["sessions", "logs", "messages"]);
        const column = pick(["expired", "archived", "deleted"]);
        return {
          language: "sql",
          difficulty: "easy",
          title: "Generated Delete",
          description: "DELETE の生成問題",
          meaning: `条件に合う行だけを \`${table}\` から削除しています。`,
          notes: [
            "テーブル名と条件列がランダムに変わります。",
            "`DELETE FROM` と `WHERE` の基本形を練習できます。",
          ],
          code: `DELETE FROM ${table} WHERE ${column} = 1;`,
        };
      },
    ],
    normal: [
      () => {
        const preset = pick([
          { table: "players", selectColumn: "name", column: "score", threshold: `${randomInt(5, 9) * 10}` },
          { table: "orders", selectColumn: "user_id", column: "total", threshold: `${randomInt(10, 50) * 10}` },
          { table: "posts", selectColumn: "title", column: "created_at", threshold: "'2026-01-01'" },
        ]);
        const orderDirection = pick(["DESC", "ASC"]);
        return {
          language: "sql",
          difficulty: "normal",
          title: "Generated Order",
          description: "WHERE と ORDER BY の生成問題",
          meaning: `条件に合う行を並び替えて取り出しています。`,
          notes: [
            "列名と並び順がランダムに変わります。",
            "複数行の SELECT 文を練習できます。",
          ],
          code: `SELECT ${preset.selectColumn}, ${preset.column}\nFROM ${preset.table}\nWHERE ${preset.column} >= ${preset.threshold}\nORDER BY ${preset.column} ${orderDirection};`,
        };
      },
      () => {
        const table = pick(["employees", "items", "orders"]);
        const groupColumn = pick(["department", "category", "status"]);
        return {
          language: "sql",
          difficulty: "normal",
          title: "Generated Group",
          description: "GROUP BY の生成問題",
          meaning: `\`${groupColumn}\` ごとの件数を集計しています。`,
          notes: [
            "集計対象のテーブルと列名が変わります。",
            "`COUNT(*) AS total` の形を練習できます。",
          ],
          code: `SELECT ${groupColumn}, COUNT(*) AS total\nFROM ${table}\nGROUP BY ${groupColumn};`,
        };
      },
      () => {
        const table = pick(["tasks", "members", "products"]);
        const textColumn = pick(["title", "name", "label"]);
        const numberColumn = pick(["price", "level", "count"]);
        return {
          language: "sql",
          difficulty: "normal",
          title: "Generated Table",
          description: "CREATE TABLE の生成問題",
          meaning: `\`${table}\` テーブルの列を定義しています。`,
          notes: [
            "テーブル名と列名がセッションごとに変わります。",
            "括弧やカンマ、制約の入力練習になります。",
          ],
          code: `CREATE TABLE ${table} (\n  id INTEGER PRIMARY KEY,\n  ${textColumn} TEXT NOT NULL,\n  ${numberColumn} INTEGER\n);`,
        };
      },
      () => {
        const leftTable = pick(["orders", "tasks", "posts"]);
        const rightTable = leftTable === "orders" ? "users" : leftTable === "tasks" ? "projects" : "authors";
        const leftColumn = leftTable === "orders" ? "user_id" : leftTable === "tasks" ? "project_id" : "author_id";
        const rightColumn = "id";
        const selectColumn =
          rightTable === "users" ? "users.name" : rightTable === "projects" ? "projects.title" : "authors.name";
        return {
          language: "sql",
          difficulty: "normal",
          title: "Generated Join",
          description: "JOIN の生成問題",
          meaning: `2つのテーブルを結合して必要な列を取り出しています。`,
          notes: [
            "結合するテーブルの組み合わせがランダムに変わります。",
            "`JOIN ... ON ...` の形を練習できます。",
          ],
          code: `SELECT ${selectColumn}, ${leftTable}.id\nFROM ${leftTable}\nJOIN ${rightTable} ON ${rightTable}.${rightColumn} = ${leftTable}.${leftColumn};`,
        };
      },
    ],
  },
};

export function getSnippetPool(
  language: Language,
  difficulty: Difficulty,
  importedSnippets: Snippet[] = [],
): Snippet[] {
  const fixedSnippets = [...SNIPPETS, ...ADDITIONAL_SNIPPETS].filter(
    (snippet) =>
      snippet.language === language && snippet.difficulty === difficulty,
  );
  const importedPool = importedSnippets.filter(
    (snippet) =>
      snippet.language === language && snippet.difficulty === difficulty,
  );
  if (importedPool.length > 0) {
    return importedPool;
  }
  const generatedSnippets = generateSnippets(language, difficulty, 8);

  return [...fixedSnippets, ...generatedSnippets];
}

function generateSnippets(
  language: Language,
  difficulty: Difficulty,
  count: number,
): Snippet[] {
  const templates = GENERATED_TEMPLATES[language][difficulty];
  const generatedAt = Date.now().toString(36);

  return Array.from({ length: count }, (_, index) => {
    const snippet = pick(templates)();
    return {
      ...snippet,
      id: `generated-${language}-${difficulty}-${generatedAt}-${index}`,
      source: "generated",
      title: `${snippet.title} ${index + 1}`,
    };
  });
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
