const CONTRACT_ADDRESS = '0x3a4bC2cd5b6c3857c08d5f248789f4d36D06E7B0';

const transformCharacterData = (characterData) => {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
      hp: characterData.hp.toNumber(),
      maxHp: characterData.maxHp.toNumber(),
      attackDamage: characterData.attackDamage.toNumber(),
    };
}

export { CONTRACT_ADDRESS, transformCharacterData };