# -*- coding: utf-8 -*-
from odoo import models, fields

class JtbdCodeSnippet(models.Model):
    _name = 'jtbd.code.snippet'
    _description = 'JTBD Code Snippet'
    _order = 'name'

    name = fields.Char(string="Snippet Name", required=True, help="A descriptive name for this code snippet.")
    description = fields.Text(string="Description", help="Explain what this snippet does and how to use it.")
    code = fields.Text(string="Python Code", required=True, help="The Python code snippet to be executed (use with extreme caution via safe_eval).")
    active = fields.Boolean(default=True)