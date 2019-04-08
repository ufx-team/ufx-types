module.exports = {
  write: true,
  prefix: '~',
  devprefix: '^',
  exclude: [
    'template'
  ],
  include: [
    'bin',
    'src',
    'lib',
  ],
  test: [
    '__test__'
  ],
  dep: [
  ],
  devdep: [
    "@types/dargs",
    "@types/fs-extra",
    "@types/inquirer",
    "@types/minimist",
  ],
  semver: [
    
  ]
};
