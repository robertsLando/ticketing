// Generated from RelationTuple.g4 by ANTLR 4.13.1

import * as antlr from 'antlr4ng';

export class RelationTupleLexer extends antlr.Lexer {
  public static readonly T__0 = 1;
  public static readonly T__1 = 2;
  public static readonly T__2 = 3;
  public static readonly T__3 = 4;
  public static readonly T__4 = 5;
  public static readonly STRING = 6;
  public static readonly CHAR = 7;

  public static readonly channelNames = ['DEFAULT_TOKEN_CHANNEL', 'HIDDEN'];

  public static readonly literalNames = [
    null,
    "'#'",
    "'@'",
    "':'",
    "'('",
    "')'",
  ];

  public static readonly symbolicNames = [
    null,
    null,
    null,
    null,
    null,
    null,
    'STRING',
    'CHAR',
  ];

  public static readonly modeNames = ['DEFAULT_MODE'];

  public static readonly ruleNames = [
    'T__0',
    'T__1',
    'T__2',
    'T__3',
    'T__4',
    'STRING',
    'CHAR',
  ];

  public constructor(input: antlr.CharStream) {
    super(input);
    this.interpreter = new antlr.LexerATNSimulator(
      this,
      RelationTupleLexer._ATN,
      RelationTupleLexer.decisionsToDFA,
      new antlr.PredictionContextCache(),
    );
  }

  public get grammarFileName(): string {
    return 'RelationTuple.g4';
  }

  public get literalNames(): (string | null)[] {
    return RelationTupleLexer.literalNames;
  }
  public get symbolicNames(): (string | null)[] {
    return RelationTupleLexer.symbolicNames;
  }
  public get ruleNames(): string[] {
    return RelationTupleLexer.ruleNames;
  }

  public get serializedATN(): number[] {
    return RelationTupleLexer._serializedATN;
  }

  public get channelNames(): string[] {
    return RelationTupleLexer.channelNames;
  }

  public get modeNames(): string[] {
    return RelationTupleLexer.modeNames;
  }

  public static readonly _serializedATN: number[] = [
    4, 0, 7, 32, 6, -1, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7,
    4, 2, 5, 7, 5, 2, 6, 7, 6, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 1, 2, 1, 3, 1, 3,
    1, 4, 1, 4, 1, 5, 4, 5, 27, 8, 5, 11, 5, 12, 5, 28, 1, 6, 1, 6, 0, 0, 7, 1,
    1, 3, 2, 5, 3, 7, 4, 9, 5, 11, 6, 13, 7, 1, 0, 1, 4, 0, 35, 35, 40, 41, 58,
    58, 64, 64, 32, 0, 1, 1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 5, 1, 0, 0, 0, 0, 7,
    1, 0, 0, 0, 0, 9, 1, 0, 0, 0, 0, 11, 1, 0, 0, 0, 0, 13, 1, 0, 0, 0, 1, 15,
    1, 0, 0, 0, 3, 17, 1, 0, 0, 0, 5, 19, 1, 0, 0, 0, 7, 21, 1, 0, 0, 0, 9, 23,
    1, 0, 0, 0, 11, 26, 1, 0, 0, 0, 13, 30, 1, 0, 0, 0, 15, 16, 5, 35, 0, 0, 16,
    2, 1, 0, 0, 0, 17, 18, 5, 64, 0, 0, 18, 4, 1, 0, 0, 0, 19, 20, 5, 58, 0, 0,
    20, 6, 1, 0, 0, 0, 21, 22, 5, 40, 0, 0, 22, 8, 1, 0, 0, 0, 23, 24, 5, 41, 0,
    0, 24, 10, 1, 0, 0, 0, 25, 27, 3, 13, 6, 0, 26, 25, 1, 0, 0, 0, 27, 28, 1,
    0, 0, 0, 28, 26, 1, 0, 0, 0, 28, 29, 1, 0, 0, 0, 29, 12, 1, 0, 0, 0, 30, 31,
    8, 0, 0, 0, 31, 14, 1, 0, 0, 0, 2, 0, 28, 0,
  ];

  private static __ATN: antlr.ATN;
  public static get _ATN(): antlr.ATN {
    if (!RelationTupleLexer.__ATN) {
      RelationTupleLexer.__ATN = new antlr.ATNDeserializer().deserialize(
        RelationTupleLexer._serializedATN,
      );
    }

    return RelationTupleLexer.__ATN;
  }

  private static readonly vocabulary = new antlr.Vocabulary(
    RelationTupleLexer.literalNames,
    RelationTupleLexer.symbolicNames,
    [],
  );

  public override get vocabulary(): antlr.Vocabulary {
    return RelationTupleLexer.vocabulary;
  }

  private static readonly decisionsToDFA =
    RelationTupleLexer._ATN.decisionToState.map(
      (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index),
    );
}
