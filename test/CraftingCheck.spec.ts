import {expect} from 'chai';
import * as Sinon from 'sinon';

import {CraftingCheck5e, Tool} from "../src/scripts/core/CraftingCheck";
import {OutcomeType} from "../src/scripts/core/FabricationOutcome";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    Sandbox.restore();
});

describe('Crafting Check 5E |', () => {

    describe('Construct |', () => {

        it('Should construct a CraftingCheck5e', () => {
            const ability = 'int';
            const baseDC = 6;
            const ingredientModifier = 1;
            const essenceModifier = 1;
            const tool = new Tool('Alchemist\'s Tools', 'Alchemy');
            const craftingCheck5e: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility(ability)
                .withBaseDC(baseDC)
                .withIngredientDCModifier(ingredientModifier)
                .withEssenceDCModifier(essenceModifier)
                .withTool(tool)
                .build();

            expect(craftingCheck5e.ability).to.equal(ability);
            expect(craftingCheck5e.baseDC).to.equal(baseDC);
            expect(craftingCheck5e.ingredientDCModifier).to.equal(ingredientModifier);
            expect(craftingCheck5e.essenceDCModifier).to.equal(essenceModifier);
            expect(craftingCheck5e.tool.name).to.equal(tool.name);
            expect(craftingCheck5e.tool.proficiencyLabel).to.equal(tool.proficiencyLabel);
        });

    });

    describe('Perform |', () => {

        it('Should succeed with sufficient roll', () => {
            const mockActor: Actor5e = <Actor5e><unknown>{
                data: {
                    data: {
                        abilities: {
                            wis: { mod: 2 },
                            int: { mod: 1 }
                        }
                    }
                }
            };

            const underTest: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility('wis')
                .withBaseDC(10)
                .build();

            const mockdiceTerm: DiceTerm = { roll: Sandbox.stub() };
            mockdiceTerm.roll.returns({result: 12, active: true});
            const mockRollTermSupplier = Sandbox.stub(underTest, 'constructRollTerm');
            mockRollTermSupplier.returns(mockdiceTerm);

            const checkResult = underTest.perform(mockActor, []);

            Sinon.assert.calledWith(mockRollTermSupplier, {
                number: 1,
                faces: 20,
                modifiers: ['+2']
            })

            expect(checkResult.successThreshold).to.equal(10);
            expect(checkResult.result).to.equal(12);
            expect(checkResult.outcome).to.equal(OutcomeType.SUCCESS);
        });

        it('Should fail with insufficient roll', () => {
            const mockActor: Actor5e = <Actor5e><unknown>{
                data: {
                    data: {
                        abilities: {
                            wis: { mod: 2 },
                            int: { mod: 1 }
                        }
                    }
                }
            };

            const underTest: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility('int')
                .withBaseDC(10)
                .build();

            const mockdiceTerm: DiceTerm = { roll: Sandbox.stub() };
            mockdiceTerm.roll.returns({result: 9, active: true});
            const mockRollTermSupplier = Sandbox.stub(underTest, 'constructRollTerm');
            mockRollTermSupplier.returns(mockdiceTerm);

            const checkResult = underTest.perform(mockActor, []);

            Sinon.assert.calledWith(mockRollTermSupplier, {
                number: 1,
                faces: 20,
                modifiers: ['+1']
            })

            expect(checkResult.successThreshold).to.equal(10);
            expect(checkResult.result).to.equal(9);
            expect(checkResult.outcome).to.equal(OutcomeType.FAILURE);
        });

        it('Should correctly calculate DC modifiers', () => {
            const mockActor: Actor5e = <Actor5e><unknown>{
                data: {
                    data: {
                        abilities: {
                            wis: { mod: 2 },
                            int: { mod: 1 }
                        }
                    }
                }
            };

            const underTest: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility('int')
                .withBaseDC(5)
                .withEssenceDCModifier(1)
                .withIngredientDCModifier(2)
                .build();

            const mockdiceTerm: DiceTerm = { roll: Sandbox.stub() };
            mockdiceTerm.roll.returns({result: 9, active: true});
            const mockRollTermSupplier = Sandbox.stub(underTest, 'constructRollTerm');
            mockRollTermSupplier.returns(mockdiceTerm);

            // @ts-ignore
            const checkResult = underTest.perform(mockActor, [{essences: ['water', 'fire']}, {essences: []}, {essences: ['earth', 'earth', 'negative-energy']}]);

            Sinon.assert.calledWith(mockRollTermSupplier, {
                number: 1,
                faces: 20,
                modifiers: ['+1']
            })

            expect(checkResult.successThreshold).to.equal(16);
            expect(checkResult.result).to.equal(9);
            expect(checkResult.outcome).to.equal(OutcomeType.FAILURE);
        });

        it('Should include proficiency bonus for proficient Actor with Tools', () => {
            const mockActor: Actor5e = <Actor5e><unknown>{
                data: {
                    data: {
                        abilities: {
                            wis: { mod: 2 },
                            int: { mod: 1 }
                        },
                        attributes: {
                            traits: {
                                toolProf: {
                                    value: ['herb', 'thief'],
                                    custom: 'custom, alchemy'
                                }
                            },
                            prof: 2
                        }
                    }
                },
                items: [
                    {type: 'tool', name: 'alchemist\'s supplies'}
                ]
            };

            const underTest: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility('int')
                .withBaseDC(10)
                .withTool(new Tool('Alchemist\'s Supplies', 'Alchemy'))
                .build();

            const mockdiceTerm: DiceTerm = { roll: Sandbox.stub() };
            mockdiceTerm.roll.returns({result: 9, active: true});
            const mockRollTermSupplier = Sandbox.stub(underTest, 'constructRollTerm');
            mockRollTermSupplier.returns(mockdiceTerm);

            const checkResult = underTest.perform(mockActor, []);

            Sinon.assert.calledWith(mockRollTermSupplier, {
                number: 1,
                faces: 20,
                modifiers: ['+1', '+2']
            })

            expect(checkResult.successThreshold).to.equal(10);
            expect(checkResult.result).to.equal(9);
            expect(checkResult.outcome).to.equal(OutcomeType.FAILURE);
        });

        it('Should exclude proficiency bonus for proficient Actor without Tools', () => {
            const mockActor: Actor5e = <Actor5e><unknown>{
                data: {
                    data: {
                        abilities: {
                            wis: { mod: 2 },
                            int: { mod: 1 }
                        },
                        attributes: {
                            traits: {
                                toolProf: {
                                    value: ['herb', 'thief'],
                                    custom: 'custom, alchemy'
                                }
                            },
                            prof: 2
                        }
                    }
                },
                items: []
            };

            const underTest: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility('int')
                .withBaseDC(10)
                .withTool(new Tool('Alchemist\'s Supplies', 'Alchemy'))
                .build();

            const mockdiceTerm: DiceTerm = { roll: Sandbox.stub() };
            mockdiceTerm.roll.returns({result: 9, active: true});
            const mockRollTermSupplier = Sandbox.stub(underTest, 'constructRollTerm');
            mockRollTermSupplier.returns(mockdiceTerm);

            const checkResult = underTest.perform(mockActor, []);

            Sinon.assert.calledWith(mockRollTermSupplier, {
                number: 1,
                faces: 20,
                modifiers: ['+1']
            })

            expect(checkResult.successThreshold).to.equal(10);
            expect(checkResult.result).to.equal(9);
            expect(checkResult.outcome).to.equal(OutcomeType.FAILURE);
        });

        it('Should exclude proficiency bonus for Actor not proficient with Tools', () => {
            const mockActor: Actor5e = <Actor5e><unknown>{
                data: {
                    data: {
                        abilities: {
                            wis: { mod: 2 },
                            int: { mod: 1 }
                        },
                        attributes: {
                            traits: {
                                toolProf: {
                                    value: ['herb', 'thief'],
                                    custom: 'custom'
                                }
                            },
                            prof: 2
                        }
                    }
                },
                items: [
                    {type: 'tool', name: 'alchemist\'s supplies'}
                ]
            };

            const underTest: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility('int')
                .withBaseDC(10)
                .withTool(new Tool('Alchemist\'s Supplies', 'Alchemy'))
                .build();

            const mockdiceTerm: DiceTerm = { roll: Sandbox.stub() };
            mockdiceTerm.roll.returns({result: 9, active: true});
            const mockRollTermSupplier = Sandbox.stub(underTest, 'constructRollTerm');
            mockRollTermSupplier.returns(mockdiceTerm);

            const checkResult = underTest.perform(mockActor, []);

            Sinon.assert.calledWith(mockRollTermSupplier, {
                number: 1,
                faces: 20,
                modifiers: ['+1']
            })

            expect(checkResult.successThreshold).to.equal(10);
            expect(checkResult.result).to.equal(9);
            expect(checkResult.outcome).to.equal(OutcomeType.FAILURE);
        });

        it('Should exclude proficiency bonus for Actor not proficient without Tools', () => {
            const mockActor: Actor5e = <Actor5e><unknown>{
                data: {
                    data: {
                        abilities: {
                            wis: { mod: 2 },
                            int: { mod: 1 }
                        },
                        attributes: {
                            traits: {
                                toolProf: {
                                    value: ['herb', 'thief'],
                                    custom: 'custom'
                                }
                            },
                            prof: 2
                        }
                    }
                },
                items: []
            };

            const underTest: CraftingCheck5e = CraftingCheck5e.builder()
                .withAbility('int')
                .withBaseDC(10)
                .withTool(new Tool('Alchemist\'s Supplies', 'Alchemy'))
                .build();

            const mockdiceTerm: DiceTerm = { roll: Sandbox.stub() };
            mockdiceTerm.roll.returns({result: 9, active: true});
            const mockRollTermSupplier = Sandbox.stub(underTest, 'constructRollTerm');
            mockRollTermSupplier.returns(mockdiceTerm);

            const checkResult = underTest.perform(mockActor, []);

            Sinon.assert.calledWith(mockRollTermSupplier, {
                number: 1,
                faces: 20,
                modifiers: ['+1']
            })

            expect(checkResult.successThreshold).to.equal(10);
            expect(checkResult.result).to.equal(9);
            expect(checkResult.outcome).to.equal(OutcomeType.FAILURE);
        });

    });

});